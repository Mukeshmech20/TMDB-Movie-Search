import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EmptyState, ErrorState } from '../components/common/States';
import Pagination from '../components/common/Pagination';
import FilterBar from '../components/filters/FilterBar';
import MovieGrid from '../components/movies/MovieGrid';
import SearchBox from '../components/search/SearchBox';
import { SEARCH_DEBOUNCE_MS, SEARCH_MIN } from '../config';
import useDebounce from '../hooks/useDebounce';
import useDiscover from '../hooks/useDiscover';
import useDocumentTitle from '../hooks/useDocumentTitle';
import useGenres from '../hooks/useGenres';

export default function Discover() {
  useDocumentTitle('Discover movies', 'Search and filter movies by genre, year, language and rating.');
  const [searchParams, setSearchParams] = useSearchParams();
  const { genres } = useGenres();
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  const genre = searchParams.get('genre') || '';
  const year = searchParams.get('year') || '';
  const rating = searchParams.get('rating') || '';
  const language = searchParams.get('language') || '';
  const sort = searchParams.get('sort') || 'popularity.desc';
  const urlQuery = searchParams.get('q') || '';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const shouldFocus = searchParams.get('focus') === 'search';

  const [text, setText] = useState(urlQuery);
  const debounced = useDebounce(text, SEARCH_DEBOUNCE_MS);
  const query = debounced.trim().length >= SEARCH_MIN ? debounced.trim() : '';

  useEffect(() => {
    if (shouldFocus) inputRef.current?.focus();
  }, [shouldFocus]);

  // A search typed in the navbar arrives through ?q=; keep the box in sync with the address bar.
  const [syncedQuery, setSyncedQuery] = useState(urlQuery);
  if (syncedQuery !== urlQuery) {
    setSyncedQuery(urlQuery);
    setText(urlQuery);
  }

  useEffect(() => {
    if (query === urlQuery) return;
    if (text.trim() !== debounced.trim()) return; // still typing, or a new ?q= has not been picked up yet
    if (debounced.trim().length > 0 && debounced.trim() !== query) return; // too short: keep URL as is
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (query) next.set('q', query);
      else next.delete('q');
      next.delete('page');
      next.delete('focus');
      return next;
    }, { replace: true });
  }, [query, urlQuery, debounced, text, setSearchParams]);

  const params = useMemo(() => ({ query: urlQuery.trim().length >= SEARCH_MIN ? urlQuery.trim() : '', genre, year, rating, language, sort, page }), [urlQuery, genre, year, rating, language, sort, page]);
  const { items, loading, error, totalPages, totalResults, retry } = useDiscover(params);

  const updateFilters = (patch) =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(patch).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
      next.delete('page');
      next.delete('focus');
      return next;
    });

  const goToPage = (n) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (n > 1) next.set('page', String(n));
      else next.delete('page');
      return next;
    });
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const clearAll = () =>
    setSearchParams((prev) => {
      const next = new URLSearchParams();
      if (prev.get('q')) next.set('q', prev.get('q'));
      return next;
    });

  const searching = text.trim() !== debounced.trim() || (loading && Boolean(params.query));
  const typedTooShort = text.trim().length > 0 && text.trim().length < SEARCH_MIN;
  const hasFilters = Boolean(genre || year || rating || language);

  return (
    <div className="page py-8">
      <p className="eyebrow">Find your next watch</p>
      <h1 className="mt-1 text-4xl font-bold sm:text-5xl">Discover</h1>
      <p className="mt-2 max-w-2xl text-mute">Search by title, then narrow by genre, year, language and rating. Everything stays in the address bar, so refresh, back and shared links keep your filters.</p>

      <div className="mt-6 space-y-4 rounded-poster border border-line bg-velvet/80 p-4 shadow-royal">
        <SearchBox value={text} onChange={setText} loading={searching} inputRef={inputRef} />
        <FilterBar filters={{ genre, year, rating, language, sort }} genres={genres} onChange={updateFilters} onClear={clearAll} />
        {params.query && <p className="text-xs text-mute">TMDB search cannot filter by genre, language, rating or sort, so those apply to each page of title matches. Clear the search to filter the whole catalogue.</p>}
      </div>

      <section ref={resultsRef} className="mt-8 scroll-mt-24" aria-live="polite" aria-busy={loading}>
        {error ? (
          <ErrorState error={error} onRetry={retry} />
        ) : loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" role="status" aria-label="Loading results">
            {Array.from({ length: 12 }, (_, i) => <div key={i} className="skeleton aspect-[2/3]" />)}
          </div>
        ) : items.length === 0 ? (
          <>
            <EmptyState
              title={params.query ? `No movies match "${params.query}"` : 'No movies match these filters'}
              message={params.query || hasFilters ? 'Try a different title, or clear a filter.' : 'Nothing to show right now.'}
            />
            {(params.query || hasFilters) && <div className="flex justify-center"><button type="button" className="btn-ghost" onClick={() => { setText(''); setSearchParams({}); }}>Reset search and filters</button></div>}
          </>
        ) : (
          <>
            <p className="mb-4 text-sm text-mute" data-testid="result-count">
              {typedTooShort ? 'Showing browse results until your search has 2 or more characters. ' : ''}
              {params.query ? `${totalResults.toLocaleString()} matches for "${params.query}"` : `${totalResults.toLocaleString()} movies`} · page {page} of {totalPages}
            </p>
            <MovieGrid movies={items} />
            <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
          </>
        )}
      </section>
    </div>
  );
}
