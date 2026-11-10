import { Link } from 'react-router-dom';
import { useMovies } from '../../context/MovieContext';
import useGenres from '../../hooks/useGenres';
import { formatRating, getYear } from '../../utils/format';
import { BookmarkIcon, HeartIcon } from '../common/Icons';
import Poster from '../common/Poster';

export default function MovieCard({ movie, className = '' }) {
  const { inWatchlist, isFavorite, toggleWatchlist, toggleFavorite } = useMovies();
  const { nameOf } = useGenres();
  const saved = inWatchlist(movie.id);
  const loved = isFavorite(movie.id);
  const genre = nameOf((movie.genre_ids || [])[0]);
  const year = getYear(movie.release_date);

  return (
    <article className={`group relative w-40 shrink-0 snap-start sm:w-44 ${className}`}>
      <div className="relative overflow-hidden rounded-poster shadow-poster transition-transform duration-300 group-hover:-translate-y-1">
        <Link to={`/movie/${movie.id}`} aria-label={`View details for ${movie.title}`}>
          <Poster path={movie.poster_path} title={movie.title} className="aspect-[2/3] w-full" />
        </Link>
        <span className="absolute left-2 top-2 rounded-pill bg-night/85 px-2 py-1 text-xs font-bold text-amber" title="TMDB community rating">
          TMDB {formatRating(movie.vote_average)}
        </span>
        <div className="absolute right-1 top-1 flex flex-col gap-1">
          <button type="button" className={`btn-icon ${saved ? 'text-amber' : ''}`} aria-pressed={saved} aria-label={saved ? `Remove ${movie.title} from watchlist` : `Add ${movie.title} to watchlist`} onClick={() => toggleWatchlist(movie)}>
            <BookmarkIcon filled={saved} />
          </button>
          <button type="button" className={`btn-icon ${loved ? 'text-crimson' : ''}`} aria-pressed={loved} aria-label={loved ? `Remove ${movie.title} from favorites` : `Add ${movie.title} to favorites`} onClick={() => toggleFavorite(movie)}>
            <HeartIcon filled={loved} />
          </button>
        </div>
      </div>
      <h3 className="mt-3 line-clamp-2 text-base font-bold leading-snug">
        <Link to={`/movie/${movie.id}`} className="hover:text-amber">{movie.title}</Link>
      </h3>
      <p className="text-sm text-mute">{[year, genre].filter(Boolean).join(', ') || 'Details unavailable'}</p>
    </article>
  );
}
