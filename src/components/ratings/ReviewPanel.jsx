import { useState } from 'react';
import { useMovies } from '../../context/MovieContext';
import { useToast } from '../../context/ToastContext';
import StarRating from './StarRating';

const MIN_REVIEW = 10;
const MAX_REVIEW = 1000;

export default function ReviewPanel({ movie }) {
  const { reviews, saveReview, removeReview } = useMovies();
  const { toast } = useToast();
  const existing = reviews[movie.id];

  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(existing?.rating || 0);
  const [text, setText] = useState(existing?.text || '');
  const [error, setError] = useState('');

  const quickRate = (value) => {
    setRating(value);
    saveReview(movie, { rating: value, text: existing?.text || '' });
  };

  const clear = () => {
    removeReview(movie);
    setRating(0);
    setText('');
    setEditing(false);
  };

  const submit = (event) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!rating) return setError('Choose a star rating first.');
    if (trimmed && trimmed.length < MIN_REVIEW) return setError(`Written reviews need at least ${MIN_REVIEW} characters. Leave it empty to save only the stars.`);
    if (trimmed.length > MAX_REVIEW) return setError(`Reviews can be at most ${MAX_REVIEW} characters.`);
    setError('');
    saveReview(movie, { rating, text: trimmed });
    setEditing(false);
  };

  const startEdit = () => {
    setRating(existing?.rating || 0);
    setText(existing?.text || '');
    setEditing(true);
    toast('Editing your review');
  };

  return (
    <section aria-labelledby="your-rating" className="stub">
      <h2 id="your-rating" className="text-xl font-bold">Your rating</h2>
      <p className="mt-1 text-sm text-mute">Hover or tap to rate in half-star steps. Arrow keys also work.</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <StarRating value={editing ? rating : existing?.rating || 0} onChange={editing ? setRating : quickRate} onClear={editing ? undefined : existing ? clear : undefined} size={34} label="Your rating" />
        <span className="text-lg font-semibold text-amber">{(editing ? rating : existing?.rating) ? `${editing ? rating : existing.rating} / 5` : 'Not rated'}</span>
      </div>

      {editing ? (
        <form onSubmit={submit} className="mt-4 space-y-3" noValidate>
          <label htmlFor="review-text" className="block text-sm font-medium">Written review (optional)</label>
          <textarea id="review-text" className="field min-h-[110px] py-2" value={text} maxLength={MAX_REVIEW} onChange={(e) => setText(e.target.value)} placeholder="What stayed with you?" aria-describedby="review-help" />
          <p id="review-help" className="text-xs text-mute">{text.length}/{MAX_REVIEW}</p>
          {error && <p className="text-sm text-crimson" role="alert">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Save review</button>
            <button type="button" className="btn-ghost" onClick={() => { setEditing(false); setError(''); }}>Cancel</button>
          </div>
        </form>
      ) : (
        <div className="mt-4 space-y-3">
          {existing?.text && <blockquote className="border-l-2 border-amber pl-3 text-sm italic">{existing.text}</blockquote>}
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-ghost" onClick={startEdit}>{existing ? 'Edit rating or review' : 'Write a review'}</button>
            {existing && <button type="button" className="btn-ghost" onClick={clear}>Remove my rating</button>}
          </div>
        </div>
      )}
      <div className="stub-divider" />
      <p className="text-xs text-mute">Your ratings and reviews are saved in this browser only (localStorage). They are not shared with other people or devices, and are separate from the TMDB community rating.</p>
    </section>
  );
}
