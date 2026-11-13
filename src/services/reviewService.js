import { getSupabase } from './supabaseClient';

/** Turns database/auth errors into messages a person can act on. */
export function friendlyError(error) {
  if (!error) return 'Something went wrong. Please try again.';
  const code = error.code || '';
  const msg = error.message || '';
  if (code === '23505' && /username/i.test(msg)) return 'That username is already taken.';
  if (code === '23505') return 'You have already done that.';
  if (code === '23514' && /body/i.test(msg)) return 'Reviews must be between 10 and 1000 characters.';
  if (code === '23514' && /rating/i.test(msg)) return 'Ratings must be between 0.5 and 5 in half-star steps.';
  if (code === '23514' && /username/i.test(msg)) return 'Usernames use 3 to 24 letters, numbers or underscores.';
  if (code === '42501') return /own review/i.test(msg) ? 'You cannot mark your own review as helpful.' : 'You do not have permission to do that.';
  if (/Failed to fetch|NetworkError|network/i.test(msg)) return 'Network error. Check your connection and try again.';
  if (/Invalid login credentials/i.test(msg)) return 'Email or password is incorrect.';
  if (/already registered/i.test(msg)) return 'An account with that email already exists. Try signing in.';
  if (/Email not confirmed/i.test(msg)) return 'Please confirm your email first. Check your inbox for the link.';
  return msg || 'Something went wrong. Please try again.';
}

const must = async () => {
  const client = await getSupabase();
  if (!client) throw new Error('Community features are not configured.');
  return client;
};
const check = ({ data, error }) => {
  if (error) {
    const wrapped = new Error(friendlyError(error));
    wrapped.cause = error;
    throw wrapped;
  }
  return data;
};

const FEED_COLUMNS = 'id,user_id,movie_id,movie_title,poster_path,release_date,genre_ids,rating,body,helpful_count,created_at,updated_at,username,display_name';

/** Row from the database -> the shape the UI uses for "my review". */
export const rowToMine = (row) => ({
  id: row.id,
  movie: { id: row.movie_id, title: row.movie_title, poster_path: row.poster_path, release_date: row.release_date || '', genre_ids: row.genre_ids || [], backdrop_path: null, vote_average: 0, overview: '' },
  rating: Number(row.rating),
  text: row.body || '',
  updatedAt: row.updated_at,
  createdAt: row.created_at,
});

export async function fetchMyReviews(userId) {
  const client = await must();
  const rows = check(await client.from('reviews').select('*').eq('user_id', userId).order('updated_at', { ascending: false }));
  return Object.fromEntries(rows.map((r) => [r.movie_id, rowToMine(r)]));
}

/** Update first (only rating/body are writable by clients), insert when the movie is new for this user. */
export async function saveRemoteReview(userId, movie, { rating, text }) {
  const client = await must();
  const body = text?.trim() ? text.trim() : null;
  const updated = check(await client.from('reviews').update({ rating, body }).eq('user_id', userId).eq('movie_id', movie.id).select());
  if (updated.length) return rowToMine(updated[0]);
  const inserted = check(
    await client.from('reviews').insert({
      user_id: userId,
      movie_id: movie.id,
      movie_title: movie.title,
      poster_path: movie.poster_path || null,
      release_date: movie.release_date || null,
      genre_ids: movie.genre_ids || (movie.genres || []).map((g) => g.id),
      rating,
      body,
    }).select(),
  );
  return rowToMine(inserted[0]);
}

export async function deleteRemoteReview(userId, movieId) {
  const client = await must();
  check(await client.from('reviews').delete().eq('user_id', userId).eq('movie_id', movieId));
}

/** Moves reviews saved in this browser into the signed-in account. Existing remote reviews are never overwritten. */
export async function importLocalReviews(userId, localMap, remoteMap) {
  let imported = 0;
  const failed = [];
  for (const entry of Object.values(localMap)) {
    if (!entry?.movie?.id || remoteMap[entry.movie.id]) continue;
    try {
      await saveRemoteReview(userId, entry.movie, { rating: entry.rating, text: entry.text });
      imported += 1;
    } catch (error) {
      failed.push({ title: entry.movie.title, message: error.message });
    }
  }
  return { imported, failed };
}

// ---- community stats (batched so a grid of 20 cards makes one request)
const statsCache = new Map();
let queue = new Map();
let timer = null;

export const invalidateStats = (movieId) => (movieId ? statsCache.delete(movieId) : statsCache.clear());

async function flush() {
  const batch = queue;
  queue = new Map();
  timer = null;
  const ids = [...batch.keys()];
  try {
    const client = await must();
    const rows = check(await client.from('movie_stats').select('movie_id,avg_rating,rating_count,review_count').in('movie_id', ids));
    const byId = new Map(rows.map((r) => [r.movie_id, { average: Number(r.avg_rating), ratings: r.rating_count, reviews: r.review_count }]));
    ids.forEach((id) => {
      const value = byId.get(id) || { average: 0, ratings: 0, reviews: 0 };
      statsCache.set(id, value);
      batch.get(id).forEach((p) => p.resolve(value));
    });
  } catch (error) {
    ids.forEach((id) => batch.get(id).forEach((p) => p.reject(error)));
  }
}

export function getCommunityStats(movieId) {
  if (statsCache.has(movieId)) return Promise.resolve(statsCache.get(movieId));
  return new Promise((resolve, reject) => {
    if (!queue.has(movieId)) queue.set(movieId, []);
    queue.get(movieId).push({ resolve, reject });
    if (!timer) timer = setTimeout(flush, 25);
  });
}

// ---- public feeds
export async function fetchMovieReviews(movieId, { sort = 'recent', limit = 20 } = {}) {
  const client = await must();
  let q = client.from('review_feed').select(FEED_COLUMNS).eq('movie_id', movieId).not('body', 'is', null);
  q = sort === 'helpful' ? q.order('helpful_count', { ascending: false }).order('created_at', { ascending: false }) : q.order('created_at', { ascending: false });
  return check(await q.limit(limit));
}

export async function fetchFeed({ kind = 'latest', limit = 12 } = {}) {
  const client = await must();
  let q = client.from('review_feed').select(FEED_COLUMNS).not('body', 'is', null);
  q = kind === 'trending' ? q.gt('helpful_count', 0).order('helpful_count', { ascending: false }).order('created_at', { ascending: false }) : q.order('created_at', { ascending: false });
  return check(await q.limit(limit));
}

export async function fetchTopReviewers(limit = 10) {
  const client = await must();
  return check(await client.from('top_reviewers').select('*').order('helpful_total', { ascending: false }).order('review_count', { ascending: false }).order('rating_count', { ascending: false }).limit(limit));
}

export async function fetchProfileByUsername(username) {
  const client = await must();
  const rows = check(await client.from('profiles').select('*').ilike('username', username).limit(1));
  return rows[0] || null;
}

export async function fetchUserReviews(userId) {
  const client = await must();
  return check(await client.from('review_feed').select(FEED_COLUMNS).eq('user_id', userId).order('updated_at', { ascending: false }).limit(100));
}

// ---- helpful votes
export async function fetchMyVotes(userId, reviewIds) {
  if (!reviewIds.length) return new Set();
  const client = await must();
  const rows = check(await client.from('review_votes').select('review_id').eq('user_id', userId).in('review_id', reviewIds));
  return new Set(rows.map((r) => r.review_id));
}

export async function setHelpful(userId, reviewId, on) {
  const client = await must();
  if (on) check(await client.from('review_votes').insert({ review_id: reviewId, user_id: userId }));
  else check(await client.from('review_votes').delete().eq('review_id', reviewId).eq('user_id', userId));
}

// ---- profile + auth
export async function fetchProfile(userId) {
  const client = await must();
  const rows = check(await client.from('profiles').select('*').eq('id', userId).limit(1));
  return rows[0] || null;
}

export async function saveProfile(userId, patch) {
  const client = await must();
  const rows = check(await client.from('profiles').update(patch).eq('id', userId).select());
  return rows[0];
}
