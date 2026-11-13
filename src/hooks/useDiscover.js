import { applyFilters, discoverMovies, searchMovies } from '../services/movieService';
import useAsync from './useAsync';

const TMDB_MAX_PAGE = 500;

/**
 * Loads one page of search or discover results. `params`: { query, genre, year, rating, language, sort, page }.
 * Requests are aborted when params change, so a slow earlier response can never overwrite a newer one.
 * TMDB search cannot filter by genre/rating/language/sort, so those narrow each fetched page locally.
 */
export default function useDiscover(params) {
  const key = JSON.stringify(params);
  const { data, error, loading, retry } = useAsync(async (signal) => {
    const opts = { signal };
    if (params.query) {
      const res = await searchMovies({ query: params.query, year: params.year, page: params.page }, opts);
      return { ...res, results: applyFilters(res.results || [], { ...params, year: '' }) };
    }
    return discoverMovies(params, opts);
  }, key);

  return {
    items: data?.results?.filter((m) => m.title) || [],
    page: data?.page || params.page,
    totalPages: Math.min(data?.total_pages || 1, TMDB_MAX_PAGE),
    totalResults: data?.total_results || 0,
    loading,
    error,
    retry,
  };
}
