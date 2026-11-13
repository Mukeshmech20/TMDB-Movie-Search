import { Link } from 'react-router-dom';
import { useMovies } from '../../context/MovieContext';
import { useReviews } from '../../context/ReviewsContext';
import useCommunityStats from '../../hooks/useCommunityStats';
import useGenres from '../../hooks/useGenres';
import { formatRating, getYear } from '../../utils/format';
import { BookmarkIcon, HeartIcon, PencilIcon, StarIcon } from '../common/Icons';
import Poster from '../common/Poster';

/**
 * Poster card. Every card exposes its four actions as labelled buttons: Rate, Review, Watchlist, Favorite.
 * The three scores are always labelled and never mixed: TMDB (out of 10), CINESCAPE community (out of 5), You (out of 5).
 */
export default function MovieCard({ movie, className = '' }) {
  const { inWatchlist, isFavorite, toggleWatchlist, toggleFavorite } = useMovies();
  const { myReview, openReview } = useReviews();
  const { nameOf } = useGenres();
  const community = useCommunityStats(movie.id);
  const mine = myReview(movie.id);
  const saved = inWatchlist(movie.id);
  const loved = isFavorite(movie.id);
  const genre = nameOf((movie.genre_ids || [])[0]);
  const year = getYear(movie.release_date);

  return (
    <article className={`group relative w-40 shrink-0 snap-start sm:w-44 ${className}`} data-testid={`movie-card-${movie.id}`}>
      <div className="relative overflow-hidden rounded-poster shadow-poster ring-1 ring-white/5 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-royal">
        <Link to={`/movie/${movie.id}`} aria-label={`View details for ${movie.title}`}>
          <Poster path={movie.poster_path} title={movie.title} className="aspect-[2/3] w-full transition-transform duration-500 group-hover:scale-[1.03]" />
        </Link>
        <span className="pointer-events-none absolute left-2 top-2 rounded-pill bg-night/85 px-2 py-1 text-[11px] font-bold text-royal-soft backdrop-blur" title="TMDB community rating (out of 10)">
          TMDB {formatRating(movie.vote_average)}
        </span>
        {mine && (
          <span className="pointer-events-none absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-pill bg-night/90 px-2 py-1 text-[11px] font-bold text-gold backdrop-blur" title="Your rating (out of 5)">
            <StarIcon filled /> You {mine.rating}
          </span>
        )}
      </div>

      <h3 className="mt-3 line-clamp-2 text-base font-bold leading-snug">
        <Link to={`/movie/${movie.id}`} className="hover:text-gold">{movie.title}</Link>
      </h3>
      <p className="text-sm text-mute">{[year, genre].filter(Boolean).join(' · ') || 'Details unavailable'}</p>
      {community && community.ratings > 0 && (
        <p className="mt-1"><span className="tag-community" title={`CINESCAPE community: ${community.ratings} ratings`}>CINESCAPE {community.average.toFixed(1)} ({community.ratings})</span></p>
      )}

      <div className="mt-2 grid grid-cols-2 gap-1.5">
        <button type="button" className="card-action" onClick={() => openReview(movie, 'stars')} aria-label={mine ? `Edit your rating for ${movie.title}: ${mine.rating} stars` : `Rate ${movie.title}`}>
          <StarIcon filled={Boolean(mine)} /> {mine ? mine.rating : 'Rate'}
        </button>
        <button type="button" className="card-action" onClick={() => openReview(movie, 'text')} aria-label={mine?.text ? `Edit your review of ${movie.title}` : `Write a review of ${movie.title}`}>
          <PencilIcon /> Review
        </button>
        <button type="button" className="card-action" aria-pressed={saved} onClick={() => toggleWatchlist(movie)} aria-label={saved ? `Remove ${movie.title} from watchlist` : `Add ${movie.title} to watchlist`}>
          <BookmarkIcon filled={saved} /> {saved ? 'Saved' : 'Watchlist'}
        </button>
        <button type="button" className="card-action" aria-pressed={loved} onClick={() => toggleFavorite(movie)} aria-label={loved ? `Remove ${movie.title} from favorites` : `Add ${movie.title} to favorites`}>
          <HeartIcon filled={loved} /> {loved ? 'Loved' : 'Favorite'}
        </button>
      </div>
    </article>
  );
}
