import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ErrorState } from '../components/common/States';
import Poster from '../components/common/Poster';
import { useReviews } from '../context/ReviewsContext';
import useAsync from '../hooks/useAsync';
import useCommunityStats from '../hooks/useCommunityStats';
import useDebounce from '../hooks/useDebounce';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { getMovieDetails, searchMovies } from '../services/movieService';
import { formatDate, formatMoney, formatRating, formatRuntime, getYear, languageName } from '../utils/format';

function Picker({ label, onPick }) {
  const [text, setText] = useState('');
  const debounced = useDebounce(text.trim(), 350);
  const [results, setResults] = useState({ key: '', items: [] });
  const active = debounced.length >= 2;

  useEffect(() => {
    if (!active) return undefined;
    const c = new AbortController();
    searchMovies({ query: debounced }, { signal: c.signal })
      .then((r) => setResults({ key: debounced, items: (r.results || []).filter((m) => m.title).slice(0, 6) }))
      .catch((e) => e.name !== 'AbortError' && setResults({ key: debounced, items: [] }));
    return () => c.abort();
  }, [debounced, active]);

  const items = active && results.key === debounced ? results.items : [];
  return (
    <div className="stub !p-4">
      <label htmlFor={`pick-${label}`} className="mb-1 block text-sm font-medium">{label}</label>
      <input id={`pick-${label}`} className="field" placeholder="Search a title" value={text} onChange={(e) => setText(e.target.value)} maxLength={100} autoComplete="off" />
      {active && results.key === debounced && items.length === 0 && <p className="mt-2 text-xs text-mute">No matches.</p>}
      {items.length > 0 && (
        <ul className="mt-2 divide-y divide-line rounded-poster border border-line">
          {items.map((m) => (
            <li key={m.id}>
              <button type="button" className="flex min-h-[44px] w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-curtain hover:text-gold" onClick={() => { onPick(m.id); setText(''); }}>
                <span className="truncate">{m.title}</span><span className="text-xs text-mute">{getYear(m.release_date)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const Community = ({ id }) => {
  const s = useCommunityStats(id);
  return s && s.ratings > 0 ? `${s.average.toFixed(1)} / 5 (${s.ratings})` : '-';
};
const Mine = ({ id }) => {
  const { myReview } = useReviews();
  const r = myReview(id);
  return r ? `${r.rating} / 5` : '-';
};
const directorOf = (m) => (m.credits?.crew || []).filter((c) => c.job === 'Director').map((c) => c.name).join(', ');

export default function Compare() {
  useDocumentTitle('Compare movies', 'Compare two movies side by side: ratings, genres, runtime and more.');
  const [params, setParams] = useSearchParams();
  const a = params.get('a') || '';
  const b = params.get('b') || '';
  const { data, error, loading, retry } = useAsync(async (signal) => {
    const [x, y] = await Promise.all([a ? getMovieDetails(a, { signal }) : null, b ? getMovieDetails(b, { signal }) : null]);
    return [x, y];
  }, `${a}:${b}`);
  const set = (key) => (id) => setParams((p) => { const n = new URLSearchParams(p); n.set(key, String(id)); return n; });
  const clear = (key) => () => setParams((p) => { const n = new URLSearchParams(p); n.delete(key); return n; });
  const [ma, mb] = data || [null, null];
  const ready = ma && mb;

  const better = (getter, higher = true) => {
    const vx = getter(ma);
    const vy = getter(mb);
    if (!vx || !vy || vx === vy) return [false, false];
    return higher ? [vx > vy, vy > vx] : [vx < vy, vy < vx];
  };

  const rows = ready ? [
    ['TMDB rating (/10)', (m) => formatRating(m.vote_average), better((m) => m.vote_average)],
    ['TMDB votes', (m) => (m.vote_count ? m.vote_count.toLocaleString() : '-'), better((m) => m.vote_count)],
    ['CINESCAPE community (/5)', (m) => <Community id={m.id} />],
    ['Your rating (/5)', (m) => <Mine id={m.id} />],
    ['Genres', (m) => (m.genres || []).map((g) => g.name).join(', ') || '-'],
    ['Runtime', (m) => formatRuntime(m.runtime) || '-', better((m) => m.runtime, false)],
    ['Release date', (m) => formatDate(m.release_date) || '-'],
    ['Director', (m) => directorOf(m) || '-'],
    ['Language', (m) => languageName(m.original_language) || '-'],
    ['Budget', (m) => formatMoney(m.budget) || '-'],
    ['Revenue', (m) => formatMoney(m.revenue) || '-', better((m) => m.revenue)],
  ] : [];

  const header = (m, key) => (
    <div className="text-center">
      <Link to={`/movie/${m.id}`} className="mx-auto block w-28 sm:w-40"><Poster path={m.poster_path} title={m.title} className="aspect-[2/3] w-full rounded-poster shadow-poster" /></Link>
      <Link to={`/movie/${m.id}`} className="mt-3 block font-display text-lg font-bold hover:text-gold">{m.title}</Link>
      <button type="button" className="mt-1 text-xs text-gold underline" onClick={clear(key)}>Change movie</button>
    </div>
  );

  return (
    <div className="page py-8">
      <p className="eyebrow">Movie comparison</p>
      <h1 className="mt-1 text-4xl font-bold sm:text-5xl">Compare two movies</h1>
      <p className="mt-2 max-w-2xl text-mute">Pick two titles. The better value in each comparable row is highlighted. The three rating rows stay separate: TMDB, CINESCAPE community and yours.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {a && ma ? header(ma, 'a') : <Picker label="First movie" onPick={set('a')} />}
        {b && mb ? header(mb, 'b') : <Picker label="Second movie" onPick={set('b')} />}
      </div>
      <div className="mt-8" aria-live="polite">
        {error ? <ErrorState error={error} onRetry={retry} /> : (a || b) && loading ? <div className="skeleton h-48" role="status" aria-label="Loading comparison" /> : ready ? (
          <div className="overflow-x-auto rounded-poster border border-line">
            <table className="w-full min-w-[480px] text-sm" data-testid="compare-table">
              <caption className="sr-only">Comparison of {ma.title} and {mb.title}</caption>
              <thead><tr className="bg-curtain text-left"><th scope="col" className="p-3 font-semibold">Attribute</th><th scope="col" className="p-3 font-semibold">{ma.title}</th><th scope="col" className="p-3 font-semibold">{mb.title}</th></tr></thead>
              <tbody>
                {rows.map(([label, get, win]) => (
                  <tr key={label} className="border-t border-line">
                    <th scope="row" className="p-3 text-left font-medium text-mute">{label}</th>
                    <td className={`p-3 ${win?.[0] ? 'font-bold text-gold' : ''}`}>{get(ma)}{win?.[0] ? <span className="sr-only"> (better)</span> : null}</td>
                    <td className={`p-3 ${win?.[1] ? 'font-bold text-gold' : ''}`}>{get(mb)}{win?.[1] ? <span className="sr-only"> (better)</span> : null}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="stub text-center text-sm text-mute">Choose two movies above to see them side by side.</p>}
      </div>
    </div>
  );
}
