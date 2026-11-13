import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../common/Modal';
import Poster from '../common/Poster';
import { REVIEW_MAX, REVIEW_MIN } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { useReviews } from '../../context/ReviewsContext';
import { getYear } from '../../utils/format';
import { ratingLabel } from './ratingLabels';
import StarRating from './StarRating';

export function validateReview({ rating, text }) {
  const trimmed = (text || '').trim();
  if (!rating) return 'Choose a star rating first. Half stars are allowed.';
  if (trimmed && trimmed.length < REVIEW_MIN) return `Written reviews need at least ${REVIEW_MIN} characters (you have ${trimmed.length}). Leave the box empty to save only the stars.`;
  if (trimmed.length > REVIEW_MAX) return `Reviews can be at most ${REVIEW_MAX} characters.`;
  return '';
}

/** Rate and review a movie. Opened from movie cards, the details page and the diary. */
export default function ReviewDialog({ movie, focus = 'stars', onClose }) {
  const { myReview, saveReview, removeReview, mode } = useReviews();
  const { enabled, user } = useAuth();
  const existing = myReview(movie.id);
  const [rating, setRating] = useState(existing?.rating || 0);
  const [text, setText] = useState(existing?.text || '');
  const [preview, setPreview] = useState(0);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const textRef = useRef(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (focus === 'text') textRef.current?.focus();
  }, [focus]);

  const run = async (task) => {
    setBusy(true);
    setError('');
    try {
      await task();
      onClose();
    } catch (e) {
      setError(e.message || 'Could not save. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const submit = (event) => {
    event.preventDefault();
    setTouched(true);
    const problem = validateReview({ rating, text });
    if (problem) return setError(problem);
    return run(() => saveReview(movie, { rating, text }));
  };

  const remaining = REVIEW_MAX - text.length;
  const shown = preview || rating;

  return (
    <Modal title={existing ? `Edit your review: ${movie.title}` : `Rate & review: ${movie.title}`} onClose={onClose} initialFocus={focus === 'text' ? 'textarea' : '[role="slider"]'}>
      <form onSubmit={submit} noValidate className="grid gap-5 sm:grid-cols-[120px_1fr]">
        <div className="hidden sm:block">
          <Poster path={movie.poster_path} title={movie.title} className="aspect-[2/3] w-full rounded-poster shadow-poster" />
        </div>
        <div className="space-y-4">
          <div>
            <p className="font-display text-xl font-bold">{movie.title} {getYear(movie.release_date) && <span className="text-mute">({getYear(movie.release_date)})</span>}</p>
            <p className="mt-1 text-xs text-mute">This is <strong className="text-paper">your</strong> rating out of 5. It is separate from the TMDB score.</p>
          </div>

          <div>
            <p id="dlg-rating-label" className="mb-1 text-sm font-medium">Your rating</p>
            <div className="flex flex-wrap items-center gap-3">
              <StarRating value={rating} onChange={(v) => { setRating(v); setError(''); }} onHover={setPreview} onClear={() => setRating(0)} size={38} label="Your rating" />
              <span className="min-w-[10ch] text-sm font-semibold text-gold" aria-live="polite" data-testid="rating-preview">{preview ? `Preview: ${ratingLabel(preview)}` : ratingLabel(shown)}</span>
            </div>
            <p className="mt-1 text-xs text-mute">Click a star (left half for a half star), or focus the stars and use the arrow keys. Home and End jump to the ends; Delete clears.</p>
          </div>

          <div>
            <label htmlFor="dlg-review" className="mb-1 block text-sm font-medium">Written review <span className="text-mute">(optional)</span></label>
            <textarea
              ref={textRef}
              id="dlg-review"
              className="field min-h-[130px] py-2"
              value={text}
              maxLength={REVIEW_MAX + 200}
              onChange={(e) => { setText(e.target.value); if (touched) setError(''); }}
              placeholder="What stayed with you? Mention the performances, pacing, ending..."
              aria-describedby="dlg-review-count"
              aria-invalid={Boolean(error)}
            />
            <p id="dlg-review-count" className={`mt-1 text-xs ${remaining < 0 ? 'text-crimson' : 'text-mute'}`}>
              {text.length} / {REVIEW_MAX} characters{text.trim() && text.trim().length < REVIEW_MIN ? ` · at least ${REVIEW_MIN} needed` : ''}
            </p>
          </div>

          {error && <p className="rounded-poster border border-crimson/60 bg-crimson/10 px-3 py-2 text-sm text-paper" role="alert">{error}</p>}

          {mode === 'device' && (
            <p className="rounded-poster border border-line bg-night/60 px-3 py-2 text-xs text-mute">
              {enabled && !user ? (<>Saving to <strong className="text-paper">this device only</strong>. <Link to="/auth" onClick={onClose} className="text-gold underline">Sign in</Link> to publish your rating and review to the CINESCAPE community.</>) : 'Saved on this device only (browser storage). Shared community reviews are not enabled on this deployment.'}
            </p>
          )}
          {mode === 'account' && <p className="rounded-poster border border-royal/40 bg-royal/10 px-3 py-2 text-xs text-royal-soft">Signed in. Your rating and review will be public and counted in the CINESCAPE community average.</p>}

          <div className="flex flex-wrap gap-2">
            <button type="submit" className="btn-primary" disabled={busy}>{busy ? 'Saving...' : existing ? 'Update' : 'Submit'}</button>
            <button type="button" className="btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
            {existing && <button type="button" className="btn-ghost ml-auto !border-crimson/50 hover:!border-crimson hover:!text-crimson" disabled={busy} onClick={() => run(() => removeReview(movie))}>Remove my {existing.text ? 'review' : 'rating'}</button>}
          </div>
        </div>
      </form>
    </Modal>
  );
}
