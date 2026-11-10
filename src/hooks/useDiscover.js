import { useCallback, useEffect, useRef, useState } from 'react';
import { applyFilters, discoverMovies, searchMovies } from '../services/movieService';

/**
 * Loads discover/search results page by page.
 * `params` must be a memoised object: { query, genre, year, rating, sort }.
 */
export default function useDiscover(params) {
  const [state, setState] = useState({ items: [], page: 0, totalPages: 1, totalResults: 0, loading: true, loadingMore: false, error: null });
  const controllerRef = useRef(null);
  const [attempt, setAttempt] = useState(0);

  const load = useCallback(
    async (nextPage, append) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      setState((s) => ({ ...s, loading: !append, loadingMore: append, error: null }));
      try {
        const opts = { signal: controller.signal };
        const data = params.query
          ? await searchMovies({ query: params.query, year: params.year, page: nextPage }, opts)
          : await discoverMovies({ ...params, page: nextPage }, opts);
        // TMDB search ignores genre/rating/sort, so those are applied locally to each fetched page.
        const results = params.query ? applyFilters(data.results || [], { ...params, year: '' }) : data.results || [];
        setState((s) => ({
          items: append ? [...s.items, ...results.filter((r) => !s.items.some((i) => i.id === r.id))] : results,
          page: data.page || nextPage,
          totalPages: data.total_pages || 1,
          totalResults: data.total_results || 0,
          loading: false,
          loadingMore: false,
          error: null,
        }));
      } catch (error) {
        if (error.name === 'AbortError') return;
        setState((s) => ({ ...s, loading: false, loadingMore: false, error }));
      }
    },
    [params],
  );

  useEffect(() => {
    load(1, false);
    return () => controllerRef.current?.abort();
  }, [load, attempt]);

  return {
    ...state,
    hasMore: state.page < state.totalPages,
    loadMore: () => load(state.page + 1, true),
    retry: () => setAttempt((n) => n + 1),
  };
}
