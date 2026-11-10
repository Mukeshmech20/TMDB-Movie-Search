import { IS_LIVE } from '../config';
import { DEMO_GENRES, DEMO_MOVIES } from '../data/fallbackMovies';
import { tmdbGet } from './tmdbApi';

const page = (results, p = 1, size = 20) => {
  const total = Math.max(1, Math.ceil(results.length / size));
  return { results: results.slice((p - 1) * size, p * size), page: p, total_pages: total, total_results: results.length };
};

const demoSorter = {
  'popularity.desc': (a, b) => b.popularity - a.popularity,
  'vote_average.desc': (a, b) => b.vote_average - a.vote_average,
  'primary_release_date.desc': (a, b) => b.release_date.localeCompare(a.release_date),
};

/** Applies discover-style filters to a list (used for demo data and for filtered search results). */
export function applyFilters(list, { genre, year, rating, sort = 'popularity.desc' }) {
  return list
    .filter((m) => (genre ? (m.genre_ids || []).includes(Number(genre)) : true))
    .filter((m) => (year ? (m.release_date || '').startsWith(String(year)) : true))
    .filter((m) => (rating ? m.vote_average >= Number(rating) : true))
    .sort(demoSorter[sort] || demoSorter['popularity.desc']);
}

const listEndpoint = (path) => (p = 1, opts) =>
  IS_LIVE
    ? tmdbGet(path, { page: p }, opts)
    : Promise.resolve(page([...DEMO_MOVIES].sort(demoSorter['popularity.desc']), p));

export const getTrending = listEndpoint('/trending/movie/week');
export const getPopular = listEndpoint('/movie/popular');
export const getNowPlaying = listEndpoint('/movie/now_playing');
export const getUpcoming = listEndpoint('/movie/upcoming');
export const getTopRated = (p = 1, opts) =>
  IS_LIVE
    ? tmdbGet('/movie/top_rated', { page: p }, opts)
    : Promise.resolve(page(applyFilters(DEMO_MOVIES, { sort: 'vote_average.desc' }), p));

let genrePromise;
export const getGenres = () => {
  if (!IS_LIVE) return Promise.resolve(DEMO_GENRES);
  if (!genrePromise) {
    genrePromise = tmdbGet('/genre/movie/list')
      .then((data) => data.genres || [])
      .catch((error) => {
        genrePromise = undefined;
        throw error;
      });
  }
  return genrePromise;
};

/** Search by title. TMDB cannot filter search by genre or rating, so those are applied to the returned page. */
export async function searchMovies({ query, year, page: p = 1 }, opts) {
  if (!IS_LIVE) {
    const q = query.toLowerCase();
    return page(DEMO_MOVIES.filter((m) => m.title.toLowerCase().includes(q)), p);
  }
  return tmdbGet('/search/movie', { query, page: p, primary_release_year: year, include_adult: false }, opts);
}

export async function discoverMovies({ genre, year, rating, sort = 'popularity.desc', page: p = 1 }, opts) {
  if (!IS_LIVE) return page(applyFilters(DEMO_MOVIES, { genre, year, rating, sort }), p);
  return tmdbGet(
    '/discover/movie',
    {
      page: p,
      sort_by: sort,
      with_genres: genre,
      primary_release_year: year,
      'vote_average.gte': rating,
      'vote_count.gte': sort.startsWith('vote_average') ? 200 : rating ? 50 : undefined,
      include_adult: false,
    },
    opts,
  );
}

/** One request returns details, credits, videos, recommendations and similar movies. */
export async function getMovieDetails(id, opts) {
  if (!IS_LIVE) {
    const found = DEMO_MOVIES.find((m) => String(m.id) === String(id));
    if (!found) {
      const error = new Error('That demo movie does not exist.');
      error.status = 404;
      throw error;
    }
    const genres = DEMO_GENRES.filter((g) => found.genre_ids.includes(g.id));
    const related = DEMO_MOVIES.filter((m) => m.id !== found.id && m.genre_ids.some((g) => found.genre_ids.includes(g))).slice(0, 8);
    return {
      ...found,
      genres,
      credits: { cast: [], crew: [] },
      videos: { results: [] },
      recommendations: { results: related },
      similar: { results: related.slice().reverse() },
      production_companies: [],
    };
  }
  return tmdbGet(`/movie/${id}`, { append_to_response: 'credits,videos,recommendations,similar' }, opts);
}
