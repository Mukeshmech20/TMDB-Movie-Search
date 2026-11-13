/** Stable, date-based pick: everyone sees the same movie on a given (UTC) day, and it rotates daily. */
export const dayKey = (date = new Date()) => date.toISOString().slice(0, 10);

const hash = (text) => {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

export function pickMovieOfTheDay(movies, date = new Date()) {
  const pool = movies.filter((m) => m.title && (m.poster_path || m.backdrop_path || true));
  if (!pool.length) return null;
  const index = hash(dayKey(date)) % pool.length;
  return { movie: pool[index], position: index + 1, poolSize: pool.length };
}

export function explainPick({ movie, position, poolSize }) {
  const votes = movie.vote_count ? ` from ${movie.vote_count.toLocaleString()} votes` : '';
  return `Chosen from TMDB's top-rated list (${poolSize} films) using today's date, so every visitor sees the same film and it changes daily. It has a TMDB score of ${Number(movie.vote_average).toFixed(1)}/10${votes}. Today's pick is entry #${position} in that rotation.`;
}
