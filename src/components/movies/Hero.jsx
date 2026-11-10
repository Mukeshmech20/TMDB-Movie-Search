import { Link } from 'react-router-dom';
import { useMovies } from '../../context/MovieContext';
import { formatRating, getYear } from '../../utils/format';
import Poster from '../common/Poster';

export default function Hero({ movie }) {
  const { inWatchlist, toggleWatchlist } = useMovies();
  const saved = inWatchlist(movie.id);

  return (
    <section className="relative isolate overflow-hidden border-b border-line" aria-label="Featured movie">
      {movie.backdrop_path && <Poster path={movie.backdrop_path} title={movie.title} kind="backdrop" className="absolute inset-0 -z-20 h-full w-full" />}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-night via-night/80 to-night/20" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-night via-transparent to-transparent" />
      <div className="page flex min-h-[420px] flex-col justify-end py-12 sm:min-h-[520px]">
        <p className="mb-3 text-sm font-semibold text-amber">Featured this week</p>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">{movie.title}</h1>
        <p className="mt-3 text-sm text-mute">{getYear(movie.release_date)} | TMDB rating {formatRating(movie.vote_average)}</p>
        <p className="mt-4 line-clamp-3 max-w-xl text-paper/90">{movie.overview || 'No synopsis is available yet.'}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to={`/movie/${movie.id}`} className="btn-primary">View details</Link>
          <button type="button" className="btn-ghost" aria-pressed={saved} onClick={() => toggleWatchlist(movie)}>{saved ? 'In your watchlist' : 'Add to watchlist'}</button>
        </div>
      </div>
    </section>
  );
}
