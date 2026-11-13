import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Poster from '../components/common/Poster';
import { ShuffleIcon, StarIcon } from '../components/common/Icons';
import { LANGUAGE_OPTIONS } from '../config';
import { useMovies } from '../context/MovieContext';
import { useReviews } from '../context/ReviewsContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import useGenres from '../hooks/useGenres';
import { discoverMovies } from '../services/movieService';
import { formatRating, getYear } from '../utils/format';

const pick = (list) => list[Math.floor(Math.random() * list.length)];

export default function Random() {
  useDocumentTitle('Random movie picker', 'Cannot decide? Let CINESCAPE pick a well-rated movie for you.');
  const { genres } = useGenres();
  const { inWatchlist, toggleWatchlist } = useMovies();
  const { openReview } = useReviews();
  const [filters, setFilters] = useState({ genre: '', rating: '7', language: '' });
  const [state, setState] = useState({ movie: null, loading: false, error: '' });
  const controller = useRef(null);

  const spin = async () => {
    controller.current?.abort();
    const c = new AbortController();
    controller.current = c;
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const base = { ...filters, sort: 'popularity.desc' };
      const first = await discoverMovies({ ...base, page: 1 }, { signal: c.signal });
      const maxPage = Math.min(first.total_pages || 1, 15);
      const page = 1 + Math.floor(Math.random() * maxPage);
      const res = page === 1 ? first : await discoverMovies({ ...base, page }, { signal: c.signal });
      const movies = (res.results || []).filter((m) => m.title);
      if (!movies.length) return setState({ movie: null, loading: false, error: 'No movies match those filters. Loosen them and try again.' });
      return setState({ movie: pick(movies), loading: false, error: '' });
    } catch (e) {
      if (e.name === 'AbortError') return undefined;
      return setState({ movie: null, loading: false, error: e.message });
    }
  };

  const { movie, loading, error } = state;
  const set = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="page py-8">
      <p className="eyebrow">Can&apos;t decide?</p>
      <h1 className="mt-1 text-4xl font-bold sm:text-5xl">Random movie picker</h1>
      <p className="mt-2 max-w-2xl text-mute">Optionally narrow the pool, then let fate choose. Every pick is a real movie from TMDB.</p>
      <div className="mt-6 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
        <div><label htmlFor="r-genre" className="mb-1 block text-sm font-medium">Genre</label><select id="r-genre" className="field" value={filters.genre} onChange={set('genre')}><option value="">Any genre</option>{genres.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
        <div><label htmlFor="r-rating" className="mb-1 block text-sm font-medium">Minimum TMDB rating</label><select id="r-rating" className="field" value={filters.rating} onChange={set('rating')}><option value="">Any</option><option value="6">6.0+</option><option value="7">7.0+</option><option value="8">8.0+</option></select></div>
        <div><label htmlFor="r-lang" className="mb-1 block text-sm font-medium">Language</label><select id="r-lang" className="field" value={filters.language} onChange={set('language')}>{LANGUAGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
      </div>
      <button type="button" className="btn-primary mt-5" onClick={spin} disabled={loading}><ShuffleIcon /> {loading ? 'Picking...' : movie ? 'Spin again' : 'Pick a movie for me'}</button>

      <section className="mt-8" aria-live="polite">
        {error && <p className="rounded-poster border border-crimson/60 bg-crimson/10 p-4 text-sm" role="alert">{error}</p>}
        {movie && !loading && (
          <div className="stub grid animate-fade-up gap-6 border-gold/40 shadow-gold sm:grid-cols-[220px_1fr]" data-testid="random-result">
            <Link to={`/movie/${movie.id}`} aria-label={`Open ${movie.title}`} className="mx-auto block w-44 sm:w-full"><Poster path={movie.poster_path} title={movie.title} className="aspect-[2/3] w-full rounded-poster shadow-poster" /></Link>
            <div>
              <p className="eyebrow">Tonight&apos;s pick</p>
              <h2 className="mt-1 text-3xl font-bold">{movie.title} <span className="text-mute">({getYear(movie.release_date)})</span></h2>
              <p className="mt-2"><span className="tag-tmdb">TMDB {formatRating(movie.vote_average)} / 10</span></p>
              <p className="mt-3 line-clamp-5 max-w-xl text-paper/90">{movie.overview || 'No synopsis available.'}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to={`/movie/${movie.id}`} className="btn-primary">See details</Link>
                <button type="button" className="btn-royal" onClick={() => openReview(movie, 'stars')}><StarIcon /> Rate it</button>
                <button type="button" className="btn-ghost" aria-pressed={inWatchlist(movie.id)} onClick={() => toggleWatchlist(movie)}>{inWatchlist(movie.id) ? 'In watchlist' : 'Add to watchlist'}</button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
