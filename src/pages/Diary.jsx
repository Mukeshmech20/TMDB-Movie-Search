import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../components/common/States';
import Poster from '../components/common/Poster';
import StarRating from '../components/ratings/StarRating';
import { useMovies } from '../context/MovieContext';
import { useReviews } from '../context/ReviewsContext';
import { useToast } from '../context/ToastContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { getYear } from '../utils/format';

const FILTERS = [['all', 'All'], ['rated', 'Rated'], ['reviewed', 'With a review']];
const fmt = (d) => new Date(`${d}T00:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

/** Personal diary + review history: every movie you logged or rated, newest first. */
export default function Diary() {
  useDocumentTitle('My diary & reviews');
  const { diary, unlogWatched } = useMovies();
  const { reviews, openReview, removeReview, mode, loadingMine, loadError } = useReviews();
  const { toast } = useToast();
  const [filter, setFilter] = useState('all');
  const [confirmId, setConfirmId] = useState(null);

  const entries = useMemo(() => {
    const ids = new Set([...Object.keys(diary), ...Object.keys(reviews)]);
    return [...ids].map((id) => {
      const d = diary[id];
      const r = reviews[id];
      return { id: Number(id), movie: r?.movie || d.movie, watchedOn: d?.watchedOn || (r?.updatedAt || '').slice(0, 10), review: r || null, logged: Boolean(d) };
    }).sort((a, b) => b.watchedOn.localeCompare(a.watchedOn));
  }, [diary, reviews]);

  const shown = entries.filter((e) => (filter === 'rated' ? e.review : filter === 'reviewed' ? e.review?.text : true));

  return (
    <div className="page py-8">
      <p className="eyebrow">Personal movie diary</p>
      <h1 className="mt-1 text-4xl font-bold sm:text-5xl">Diary & reviews</h1>
      <p className="mt-2 max-w-2xl text-mute">Everything you have watched and rated. Rating a movie logs it here automatically. {mode === 'account' ? 'Ratings and reviews live in your account; the watched dates are stored on this device.' : 'Stored on this device.'}</p>
      {loadError && <p className="mt-3 rounded-poster border border-crimson/60 bg-crimson/10 px-3 py-2 text-sm" role="alert">Could not load your account reviews: {loadError}</p>}

      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter diary">
        {FILTERS.map(([id, label]) => <button key={id} type="button" className={`chip ${filter === id ? '!border-gold !text-gold' : ''}`} aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}</button>)}
      </div>

      <div className="mt-6">
        {loadingMine ? <div className="skeleton h-32" /> : shown.length === 0 ? (
          <EmptyState title={entries.length ? 'Nothing matches this filter' : 'Your diary is empty'} message={entries.length ? 'Try another filter.' : 'Rate a movie or tap "Log as watched" on a movie page and it will appear here.'} actionLabel="Find a movie" actionTo="/discover" />
        ) : (
          <ul className="space-y-3">
            {shown.map(({ id, movie, watchedOn, review, logged }) => (
              <li key={id} className="stub !p-4" data-testid="diary-entry">
                <div className="flex gap-4">
                  <Link to={`/movie/${id}`} className="w-20 shrink-0 sm:w-24" aria-label={`Open ${movie.title}`}><Poster path={movie.poster_path} title={movie.title} className="aspect-[2/3] w-full rounded-lg" /></Link>
                  <div className="min-w-0 flex-1">
                    <Link to={`/movie/${id}`} className="font-display text-xl font-bold hover:text-gold">{movie.title}</Link> <span className="text-mute">{getYear(movie.release_date) && `(${getYear(movie.release_date)})`}</span>
                    <p className="text-xs text-mute">{watchedOn ? `Watched ${fmt(watchedOn)}` : 'Watched'}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <StarRating value={review?.rating || 0} size={20} label={`Your rating for ${movie.title}`} />
                      <span className="text-sm text-gold">{review ? `${review.rating} / 5` : 'Not rated'}</span>
                    </div>
                    {review?.text && <blockquote className="mt-2 whitespace-pre-line break-words border-l-2 border-gold pl-3 text-sm italic">{review.text}</blockquote>}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button type="button" className="card-action !px-3" onClick={() => openReview(movie, review?.text ? 'text' : 'stars')}>{review ? 'Edit rating / review' : 'Rate or review'}</button>
                      {review && (confirmId === id ? (
                        <span className="inline-flex items-center gap-2 text-xs">Delete your {review.text ? 'review' : 'rating'}?
                          <button type="button" className="card-action !border-crimson !px-3 !text-crimson" onClick={async () => { try { await removeReview(movie); } catch (e) { toast(e.message, 'error'); } setConfirmId(null); }}>Yes, delete</button>
                          <button type="button" className="card-action !px-3" onClick={() => setConfirmId(null)}>Keep</button></span>
                      ) : <button type="button" className="card-action !px-3" onClick={() => setConfirmId(id)}>Delete {review.text ? 'review' : 'rating'}</button>)}
                      {logged && <button type="button" className="card-action !px-3" onClick={() => unlogWatched(movie)}>Remove from diary</button>}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
