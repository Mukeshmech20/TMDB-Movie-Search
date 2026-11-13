import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useReviews } from '../../context/ReviewsContext';
import useCommunityStats from '../../hooks/useCommunityStats';
import { formatRating } from '../../utils/format';
import { ratingLabel } from './ratingLabels';
import StarRating from './StarRating';

/** Three clearly separated scores: TMDB (/10), CINESCAPE community (/5) and the viewer's own (/5). */
export default function RatingPanels({ movie }) {
  const { enabled } = useAuth();
  const { myReview, openReview, mode } = useReviews();
  const community = useCommunityStats(movie.id);
  const mine = myReview(movie.id);

  return (
    <div className="space-y-4" data-testid="rating-panels">
      <section className="stub" aria-labelledby="tmdb-rating">
        <h2 id="tmdb-rating" className="text-lg font-bold text-royal-soft">TMDB rating</h2>
        <div className="mt-3 flex items-center gap-3">
          <span className="font-display text-4xl font-bold">{formatRating(movie.vote_average)}<span className="text-base text-mute"> / 10</span></span>
          <div>
            <StarRating value={movie.vote_average ? Number(movie.vote_average) / 2 : 0} size={18} label="TMDB rating" />
            <p className="text-xs text-mute">{movie.vote_count ? `${movie.vote_count.toLocaleString()} votes on TMDB` : 'No votes yet'}</p>
          </div>
        </div>
        <p className="mt-2 text-xs text-mute">Scored by TMDB users. Not the same as CINESCAPE ratings.</p>
      </section>

      <section className="stub border-gold/40" aria-labelledby="cs-rating">
        <h2 id="cs-rating" className="text-lg font-bold text-gold">CINESCAPE community</h2>
        {!enabled ? (
          <p className="mt-2 text-sm text-mute">Shared community ratings are not enabled on this deployment. Your own rating below is still saved on this device.</p>
        ) : community && community.ratings > 0 ? (
          <div className="mt-3 flex items-center gap-3">
            <span className="font-display text-4xl font-bold" data-testid="community-average">{community.average.toFixed(1)}<span className="text-base text-mute"> / 5</span></span>
            <div>
              <StarRating value={community.average} size={18} label="CINESCAPE community rating" />
              <p className="text-xs text-mute">{community.ratings} {community.ratings === 1 ? 'rating' : 'ratings'} · {community.reviews} written {community.reviews === 1 ? 'review' : 'reviews'}</p>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-mute">{community ? 'No CINESCAPE ratings yet. Yours could be the first.' : 'Loading community rating...'}</p>
        )}
      </section>

      <section className="stub border-crimson/40" aria-labelledby="your-rating">
        <h2 id="your-rating" className="text-lg font-bold">Your rating</h2>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <StarRating value={mine?.rating || 0} size={26} label="Your rating" />
          <span className="text-sm font-semibold text-gold" data-testid="my-rating-label">{ratingLabel(mine?.rating || 0)}</span>
        </div>
        {mine?.text && <blockquote className="mt-3 border-l-2 border-gold pl-3 text-sm italic">{mine.text}</blockquote>}
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="btn-primary" onClick={() => openReview(movie, 'stars')}>{mine ? 'Edit rating' : 'Rate this movie'}</button>
          <button type="button" className="btn-ghost" onClick={() => openReview(movie, 'text')}>{mine?.text ? 'Edit review' : 'Write a review'}</button>
        </div>
        <p className="mt-3 text-xs text-mute">
          {mode === 'account' ? 'Saved to your account and shared with the community.' : enabled ? <>Saved on this device. <Link to="/auth" className="text-gold underline">Sign in</Link> to share it.</> : 'Saved on this device (browser storage).'}
        </p>
      </section>
    </div>
  );
}
