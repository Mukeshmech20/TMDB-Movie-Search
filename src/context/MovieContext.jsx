import { createContext, useCallback, useContext, useMemo } from 'react';
import { RECENT_LIMIT, STORAGE_KEYS } from '../config';
import useLocalStorage from '../hooks/useLocalStorage';
import { useToast } from './ToastContext';

const MovieContext = createContext(null);

/** Keeps only what list pages need, so stored data stays small and consistent. */
export const snapshot = (m) => ({
  id: m.id,
  title: m.title,
  release_date: m.release_date || '',
  poster_path: m.poster_path || null,
  backdrop_path: m.backdrop_path || null,
  vote_average: m.vote_average || 0,
  genre_ids: m.genre_ids || (m.genres || []).map((g) => g.id),
  overview: m.overview || '',
  ...(m.runtime ? { runtime: m.runtime } : {}),
});

const today = () => new Date().toISOString().slice(0, 10);

/** Watchlist, favorites, recently viewed and the viewing diary. These live on this device (localStorage). */
export function MovieProvider({ children }) {
  const { toast } = useToast();
  const [watchlist, setWatchlist] = useLocalStorage(STORAGE_KEYS.watchlist, []);
  const [favorites, setFavorites] = useLocalStorage(STORAGE_KEYS.favorites, []);
  const [recent, setRecent] = useLocalStorage(STORAGE_KEYS.recent, []);
  const [diary, setDiary] = useLocalStorage(STORAGE_KEYS.diary, {});

  const makeToggle = useCallback(
    (list, setter, label) => (movie) => {
      const exists = list.some((m) => m.id === movie.id);
      setter((prev) => (exists ? prev.filter((m) => m.id !== movie.id) : [snapshot(movie), ...prev.filter((m) => m.id !== movie.id)]));
      toast(exists ? `Removed "${movie.title}" from ${label}` : `Added "${movie.title}" to ${label}`);
    },
    [toast],
  );

  const toggleWatchlist = useMemo(() => makeToggle(watchlist, setWatchlist, 'your watchlist'), [makeToggle, watchlist, setWatchlist]);
  const toggleFavorite = useMemo(() => makeToggle(favorites, setFavorites, 'your favorites'), [makeToggle, favorites, setFavorites]);

  const addRecent = useCallback(
    (movie) => setRecent((prev) => [snapshot(movie), ...prev.filter((m) => m.id !== movie.id)].slice(0, RECENT_LIMIT)),
    [setRecent],
  );

  /** Records a movie as watched. Existing entries keep their original date unless one is given. */
  const logWatched = useCallback(
    (movie, watchedOn, { quiet = false } = {}) => {
      setDiary((prev) => (prev[movie.id] && !watchedOn ? prev : { ...prev, [movie.id]: { movie: snapshot(movie), watchedOn: watchedOn || today() } }));
      if (!quiet) toast(`Logged "${movie.title}" in your diary`);
    },
    [setDiary, toast],
  );

  const unlogWatched = useCallback(
    (movie) => {
      setDiary((prev) => {
        const next = { ...prev };
        delete next[movie.id];
        return next;
      });
      toast(`Removed "${movie.title}" from your diary`);
    },
    [setDiary, toast],
  );

  const value = useMemo(
    () => ({
      watchlist,
      favorites,
      recent,
      diary,
      inWatchlist: (id) => watchlist.some((m) => m.id === id),
      isFavorite: (id) => favorites.some((m) => m.id === id),
      inDiary: (id) => Boolean(diary[id]),
      toggleWatchlist,
      toggleFavorite,
      addRecent,
      logWatched,
      unlogWatched,
    }),
    [watchlist, favorites, recent, diary, toggleWatchlist, toggleFavorite, addRecent, logWatched, unlogWatched],
  );

  return <MovieContext.Provider value={value}>{children}</MovieContext.Provider>;
}

export const useMovies = () => {
  const ctx = useContext(MovieContext);
  if (!ctx) throw new Error('useMovies must be used inside MovieProvider');
  return ctx;
};
