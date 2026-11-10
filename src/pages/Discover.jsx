import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EmptyState, ErrorState } from '../components/common/States';
import FilterBar from '../components/filters/FilterBar';
import MovieGrid from '../components/movies/MovieGrid';
import SearchBox from '../components/search/SearchBox';
import { SEARCH_DEBOUNCE_MS, SEARCH_MIN } from '../config';
import useDebounce from '../hooks/useDebounce';
import useDiscover from '../hooks/useDiscover';
import useGenres from '../hooks/useGenres';

export default function Discover() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { genres } = useGenres();
  const inputRef = useRef(null);

  const genre = searchParams.get('genre') || '';
  const year = searchParams.get('year') || '';
  const rating = searchParams.get('rating') || '';
  const sort = searchParams.get('sort') || 'popularity.desc';
  const urlQuery = searchParams.get('q') || '';
  const shouldFocus = searchParams.get('focus') === 'search';

  const [text, setText] = useState(urlQuery);
  const debounced = useDebounce(text, SEARCH_DEBOUNCE_MS);
  const query = debounced.trim().length >= SEARCH_MIN ? debounced.trim() : '';

  useEffect(() => {
    if (shouldFocus) inputRef.current?.focus();
  }, [shouldFocus]);

  useEffect(() => {
    if (query === urlQuery) return;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (query) next.set('q', query);
      else next.delete('q');
      next.delete('focus');
      return next;
    }, { replace: true });
  }, [query, urlQuery, setSearchParams]);

  const params = useMemo(() => ({ query, genre, year, rating, sort }), [query, genre, year, rating, sort]);
  const { items, loading, loadingMore, error, hasMore, loadMore, retry, totalResults } = useDiscover(params);

  const updateFilters = (patch) =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(patch).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
      next.delete('focus');
      return next;
    });

  const clearAll = () =>
    setSearchParams((prev) => {
      const next = new URLSearchParams();
      if (prev.get('q')) next.set('q', prev.get('q'));
      return next;
    });

  const searching = text.trim() !== debounced.trim() || (loading && Boolean(query));
  const typedTooShort = text.trim().length > 0 && text.trim().length < SEARCH_MIN;
  const hasFilters = Boolean(genre || year || rating);

  return (
    <div className="page py-8">
      <h1 className="text-4xl font-bold">Discover</h1>
      <p className="mt-1 text-mute">Search by title, then narrow with genre, year and rating. Filters stay in the address bar, so back and refresh keep them.</p>

      <div className="mt-6 space-y-4 rounded-poster border border-line bg-velvet p-4">
        <SearchBox value={text} onChange={setText} loading={searching} inputRef={inputRef} />
        <FilterBar filters={{ genre, year, rating, sort }} genres={genres} onChange={updateFilters} onClear={clearAll} />
        {query && <p className="text-xs text-mute">While searching, genre, rating and sort are applied to each page of title matches that has been loaded. Clear the search to filter the whole catalogue.</p>}
      </div>

      <section className="mt-8" aria-live="polite" aria-busy={loading}>
        {error ? (
          <ErrorState error={error} onRetry={retry} />
        ) : loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" aria-label="Loading results">
            {Array.from({ length: 12 }, (_, i) => <div key={i} className="skeleton aspect-[2/3]" />)}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title={query ? `No movies match "${query}"` : 'No movies match these filters'}
            message={query || hasFilters ? 'Try a different title, or clear a filter.' : 'Nothing to show right now.'}
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-mute">
              {typedTooShort ? 'Showing browse results until your search has 2 or more characters. ' : ''}
              {query ? `${totalResults} matches for "${query}"` : `${totalResults} movies`}
            </p>
            <MovieGrid movies={items} />
            {hasMore && (
              <div className="mt-10 flex justify-center">
                <button type="button" className="btn-primary" onClick={loadMore} disabled={loadingMore}>{loadingMore ? 'Loading...' : 'Load more'}</button>
              </div>
            )}
          </>
        )}
        {!loading && !error && items.length === 0 && (query || hasFilters) && (
          <div className="flex justify-center"><button type="button" className="btn-ghost" onClick={() => { setText(''); setSearchParams({}); }}>Reset search and filters</button></div>
        )}
      </section>
    </div>
  );
}
