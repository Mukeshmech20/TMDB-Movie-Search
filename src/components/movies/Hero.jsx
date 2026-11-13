import { Link } from 'react-router-dom';
import { useMovies } from '../../context/MovieContext';
import { useReviews } from '../../context/ReviewsContext';
import { formatRating, getYear } from '../../utils/format';
import { BookmarkIcon, StarIcon } from '../common/Icons';
import Poster from '../common/Poster';

export default function Hero({ movie }) {
  const { inWatchlist, toggleWatchlist } = useMovies();
  const { openReview, myReview } = useReviews();
  const saved = inWatchlist(movie.id);
  const mine = myReview(movie.id);

  return (
    <section className="relative isolate overflow-hidden border-b border-line" aria-label="Featured movie">
      {movie.backdrop_path && <Poster path={movie.backdrop_path} title={movie.title} kind="backdrop" className="absolute inset-0 -z-20 h-full w-full animate-fade-in" />}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-night via-night/80 to-night/10" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-night via-night/20 to-transparent" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(700px_400px_at_80%_20%,rgba(124,77,255,.25),transparent)]" />
      <div className="page flex min-h-[460px] flex-col justify-end py-12 sm:min-h-[580px]">
        <p className="eyebrow mb-3 animate-fade-up">Featured this week</p>
        <h1 className="max-w-3xl animate-fade-up text-4xl font-bold leading-tight sm:text-6xl">{movie.title}</h1>
        <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-mute">
          <span>{getYear(movie.release_date)}</span>
          <span className="tag-tmdb">TMDB {formatRating(movie.vote_average)} / 10</span>
        </p>
        <p className="mt-4 line-clamp-3 max-w-xl text-paper/90">{movie.overview || 'No synopsis is available yet.'}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to={`/movie/${movie.id}`} className="btn-primary">View details</Link>
          <button type="button" className="btn-royal" onClick={() => openReview(movie, 'stars')}><StarIcon filled={Boolean(mine)} /> {mine ? `Your rating: ${mine.rating}` : 'Rate this movie'}</button>
          <button type="button" className="btn-ghost" aria-pressed={saved} onClick={() => toggleWatchlist(movie)}><BookmarkIcon filled={saved} /> {saved ? 'In your watchlist' : 'Add to watchlist'}</button>
        </div>
      </div>
    </section>
  );
}
