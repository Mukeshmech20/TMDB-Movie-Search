import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useReviews } from '../../context/ReviewsContext';
import { useToast } from '../../context/ToastContext';
import { fetchMovieReviews, fetchMyVotes, setHelpful } from '../../services/reviewService';
import { PencilIcon, ThumbIcon } from '../common/Icons';
import StarRating from './StarRating';

const dateFmt = (iso) => new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export function ReviewCard({ review, voted, onVote, own, onEdit, onDelete, showMovie }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <li className="stub !p-4" data-testid="review-item">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {showMovie && <Link to={`/movie/${review.movie_id}`} className="block truncate font-display text-lg font-bold hover:text-gold">{review.movie_title}</Link>}
          <p className="text-sm">
            <Link to={`/u/${review.username}`} className="font-semibold text-gold hover:underline">{review.display_name || review.username}</Link>
            <span className="text-mute"> · {dateFmt(review.created_at)}{review.updated_at !== review.created_at ? ' (edited)' : ''}</span>
          </p>
        </div>
        <StarRating value={Number(review.rating)} size={16} label={`${review.username} rated ${review.rating} out of 5`} />
      </div>
      <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed">{review.body}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="card-action !px-3"
          aria-pressed={voted}
          disabled={own}
          title={own ? 'You cannot vote on your own review' : undefined}
          onClick={() => onVote(review)}
        >
          <ThumbIcon filled={voted} /> Helpful · {review.helpful_count}
        </button>
        {own && onEdit && (
          <>
            <button type="button" className="card-action !px-3" onClick={() => onEdit(review)}><PencilIcon /> Edit</button>
            {confirming ? (
              <span className="inline-flex items-center gap-2 text-xs">
                Delete this review?
                <button type="button" className="card-action !border-crimson !px-3 !text-crimson" onClick={() => onDelete(review)}>Yes, delete</button>
                <button type="button" className="card-action !px-3" onClick={() => setConfirming(false)}>Keep</button>
              </span>
            ) : (
              <button type="button" className="card-action !px-3" onClick={() => setConfirming(true)}>Delete</button>
            )}
          </>
        )}
      </div>
    </li>
  );
}

/** Hook shared by every list of public reviews: loads my votes and toggles helpful with rollback on failure. */
export function useHelpfulVotes(items, setItems) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [voted, setVoted] = useState(new Set());
  const ids = items.map((r) => r.id).join(',');

  useEffect(() => {
    if (!user || !ids) return undefined;
    let cancelled = false;
    fetchMyVotes(user.id, ids.split(',')).then((s) => !cancelled && setVoted(s)).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user, ids]);

  const vote = useCallback(
    async (review) => {
      if (!user) {
        toast('Sign in to mark reviews as helpful.');
        navigate('/auth');
        return;
      }
      const on = !voted.has(review.id);
      const apply = (delta, nextOn) => {
        setVoted((prev) => {
          const next = new Set(prev);
          if (nextOn) next.add(review.id);
          else next.delete(review.id);
          return next;
        });
        setItems((list) => list.map((r) => (r.id === review.id ? { ...r, helpful_count: Math.max(0, r.helpful_count + delta) } : r)));
      };
      apply(on ? 1 : -1, on);
      try {
        await setHelpful(user.id, review.id, on);
      } catch (error) {
        apply(on ? -1 : 1, !on);
        toast(error.message, 'error');
      }
    },
    [user, voted, toast, navigate, setItems],
  );

  return { voted, vote, userId: user?.id };
}

export default function ReviewList({ movie }) {
  const { enabled } = useAuth();
  const { openReview, removeReview, statsVersion } = useReviews();
  const { toast } = useToast();
  const [sort, setSort] = useState('recent');
  const [state, setState] = useState({ key: '', items: [], error: '' });
  const key = `${movie.id}:${sort}:${statsVersion}`;

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    fetchMovieReviews(movie.id, { sort })
      .then((items) => !cancelled && setState({ key, items, error: '' }))
      .catch((error) => !cancelled && setState({ key, items: [], error: error.message }));
    return () => {
      cancelled = true;
    };
  }, [enabled, movie.id, sort, key]);

  const loading = state.key !== key;
  const setItems = useCallback((updater) => setState((s) => ({ ...s, items: updater(s.items) })), []);
  const { voted, vote, userId } = useHelpfulVotes(state.items, setItems);

  if (!enabled) {
    return (
      <section aria-labelledby="community-reviews" className="stub">
        <h2 id="community-reviews" className="text-2xl font-bold">Community reviews</h2>
        <p className="mt-2 text-sm text-mute">Shared reviews need the CINESCAPE community database, which is not configured on this deployment. You can still rate and review any movie; it is saved on this device and appears in your diary.</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="community-reviews">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="community-reviews" className="text-2xl font-bold">Community reviews</h2>
        <div>
          <label htmlFor="review-sort" className="sr-only">Sort reviews</label>
          <select id="review-sort" className="field !min-h-[38px] !w-auto" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="recent">Most recent</option>
            <option value="helpful">Most helpful</option>
          </select>
        </div>
      </div>
      <div className="mt-4" aria-live="polite" aria-busy={loading}>
        {loading ? (
          <div className="space-y-3">{[0, 1].map((i) => <div key={i} className="skeleton h-24" />)}</div>
        ) : state.error ? (
          <p className="rounded-poster border border-crimson/60 bg-crimson/10 p-4 text-sm" role="alert">{state.error}</p>
        ) : state.items.length === 0 ? (
          <div className="stub text-center">
            <p className="font-display text-xl font-bold">No written reviews yet</p>
            <p className="mt-1 text-sm text-mute">Be the first to tell the community what you thought.</p>
            <button type="button" className="btn-primary mt-4" onClick={() => openReview(movie, 'text')}>Write a review</button>
          </div>
        ) : (
          <ul className="space-y-3">
            {state.items.map((r) => (
              <ReviewCard
                key={r.id}
                review={r}
                voted={voted.has(r.id)}
                own={r.user_id === userId}
                onVote={vote}
                onEdit={() => openReview(movie, 'text')}
                onDelete={async () => {
                  try {
                    await removeReview(movie);
                  } catch (error) {
                    toast(error.message, 'error');
                  }
                }}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
