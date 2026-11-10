import { createContext, useCallback, useContext, useMemo } from 'react';
import { RECENT_LIMIT, STORAGE_KEYS } from '../config';
import useLocalStorage from '../hooks/useLocalStorage';
import { useToast } from './ToastContext';

const MovieContext = createContext(null);

/** Keeps only what list pages need, so stored data stays small and consistent. */
const snapshot = (m) => ({
  id: m.id,
  title: m.title,
  release_date: m.release_date || '',
  poster_path: m.poster_path || null,
  backdrop_path: m.backdrop_path || null,
  vote_average: m.vote_average || 0,
  genre_ids: m.genre_ids || (m.genres || []).map((g) => g.id),
  overview: m.overview || '',
});

export function MovieProvider({ children }) {
  const { toast } = useToast();
  const [watchlist, setWatchlist] = useLocalStorage(STORAGE_KEYS.watchlist, []);
  const [favorites, setFavorites] = useLocalStorage(STORAGE_KEYS.favorites, []);
  const [reviews, setReviews] = useLocalStorage(STORAGE_KEYS.reviews, {});
  const [recent, setRecent] = useLocalStorage(STORAGE_KEYS.recent, []);

  const toggleIn = useCallback(
    (setter, list, label) => (movie) => {
      const exists = list.some((m) => m.id === movie.id);
      setter(exists ? list.filter((m) => m.id !== movie.id) : [snapshot(movie), ...list]);
      toast(exists ? `Removed "${movie.title}" from ${label}` : `Added "${movie.title}" to ${label}`);
    },
    [toast],
  );

  const toggleWatchlist = useMemo(() => toggleIn(setWatchlist, watchlist, 'your watchlist'), [toggleIn, setWatchlist, watchlist]);
  const toggleFavorite = useMemo(() => toggleIn(setFavorites, favorites, 'your favorites'), [toggleIn, setFavorites, favorites]);

  const saveReview = useCallback(
    (movie, { rating, text }) => {
      setReviews((prev) => ({
        ...prev,
        [movie.id]: { movie: snapshot(movie), rating, text: text || '', updatedAt: new Date().toISOString() },
      }));
      toast(`Saved your rating for "${movie.title}"`);
    },
    [setReviews, toast],
  );

  const removeReview = useCallback(
    (movie) => {
      setReviews((prev) => {
        const next = { ...prev };
        delete next[movie.id];
        return next;
      });
      toast(`Removed your rating for "${movie.title}"`);
    },
    [setReviews, toast],
  );

  const addRecent = useCallback(
    (movie) => setRecent((prev) => [snapshot(movie), ...prev.filter((m) => m.id !== movie.id)].slice(0, RECENT_LIMIT)),
    [setRecent],
  );

  const value = {
    watchlist,
    favorites,
    reviews,
    recent,
    inWatchlist: (id) => watchlist.some((m) => m.id === id),
    isFavorite: (id) => favorites.some((m) => m.id === id),
    toggleWatchlist,
    toggleFavorite,
    saveReview,
    removeReview,
    addRecent,
  };

  return <MovieContext.Provider value={value}>{children}</MovieContext.Provider>;
}

export const useMovies = () => {
  const ctx = useContext(MovieContext);
  if (!ctx) throw new Error('useMovies must be used inside MovieProvider');
  return ctx;
};
