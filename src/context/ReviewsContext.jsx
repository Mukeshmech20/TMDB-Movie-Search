import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import ReviewDialog from '../components/ratings/ReviewDialog';
import { IS_COMMUNITY_ENABLED, STORAGE_KEYS } from '../config';
import useLocalStorage from '../hooks/useLocalStorage';
import { deleteRemoteReview, fetchMyReviews, importLocalReviews, invalidateStats, saveRemoteReview } from '../services/reviewService';
import { useAuth } from './AuthContext';
import { snapshot, useMovies } from './MovieContext';
import { useToast } from './ToastContext';

const ReviewsContext = createContext(null);

/**
 * "My reviews" for the current person.
 * - Signed in (Supabase configured): stored in the database and shared with the community.
 * - Otherwise: stored in this browser (localStorage). Local data is never deleted by signing in;
 *   it can be imported into the account with importLocal().
 */
export function ReviewsProvider({ children }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { logWatched } = useMovies();
  const [local, setLocal] = useLocalStorage(STORAGE_KEYS.reviews, {});
  const [dismissed, setDismissed] = useLocalStorage(STORAGE_KEYS.importDismissed, false);
  const [remote, setRemote] = useState({ userId: null, map: {}, error: '' });
  const [statsVersion, setStatsVersion] = useState(0);
  const [dialog, setDialog] = useState(null);

  const userId = user?.id || null;
  useEffect(() => {
    if (!userId) return undefined;
    let cancelled = false;
    fetchMyReviews(userId)
      .then((map) => !cancelled && setRemote({ userId, map, error: '' }))
      .catch((error) => !cancelled && setRemote({ userId, map: {}, error: error.message }));
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const remoteReady = Boolean(userId) && remote.userId === userId;
  const useRemote = IS_COMMUNITY_ENABLED && Boolean(userId);
  const reviews = useMemo(() => (useRemote ? (remoteReady ? remote.map : {}) : local), [useRemote, remoteReady, remote.map, local]);
  const mode = useRemote ? 'account' : 'device';

  const bump = useCallback((movieId) => {
    invalidateStats(movieId);
    setStatsVersion((v) => v + 1);
  }, []);

  const saveReview = useCallback(
    async (movie, { rating, text }) => {
      const cleanText = (text || '').trim();
      if (useRemote) {
        const mine = await saveRemoteReview(userId, movie, { rating, text: cleanText });
        setRemote((r) => ({ ...r, map: { ...r.map, [movie.id]: mine } }));
        bump(movie.id);
      } else {
        setLocal((prev) => ({ ...prev, [movie.id]: { movie: snapshot(movie), rating, text: cleanText, updatedAt: new Date().toISOString() } }));
      }
      logWatched(movie, undefined, { quiet: true });
      toast(useRemote ? `Saved. Your ${cleanText ? 'review' : 'rating'} for "${movie.title}" is now public.` : `Saved your ${cleanText ? 'review' : 'rating'} for "${movie.title}" on this device.`);
    },
    [useRemote, userId, setLocal, logWatched, toast, bump],
  );

  const removeReview = useCallback(
    async (movie) => {
      if (useRemote) {
        await deleteRemoteReview(userId, movie.id);
        setRemote((r) => {
          const map = { ...r.map };
          delete map[movie.id];
          return { ...r, map };
        });
        bump(movie.id);
      } else {
        setLocal((prev) => {
          const next = { ...prev };
          delete next[movie.id];
          return next;
        });
      }
      toast(`Removed your rating for "${movie.title}"`);
    },
    [useRemote, userId, setLocal, toast, bump],
  );

  const importable = useMemo(
    () => (useRemote && remoteReady ? Object.values(local).filter((e) => e?.movie?.id && !remote.map[e.movie.id]) : []),
    [useRemote, remoteReady, local, remote.map],
  );

  const importLocal = useCallback(async () => {
    const result = await importLocalReviews(userId, local, remote.map);
    const map = await fetchMyReviews(userId);
    setRemote({ userId, map, error: '' });
    bump();
    toast(result.failed.length ? `Imported ${result.imported}; ${result.failed.length} could not be imported.` : `Imported ${result.imported} ${result.imported === 1 ? 'rating' : 'ratings'} into your account.`, result.failed.length ? 'error' : 'info');
    return result;
  }, [userId, local, remote.map, bump, toast]);

  const value = useMemo(
    () => ({
      reviews,
      mode,
      loadingMine: useRemote && !remoteReady,
      loadError: remote.error,
      myReview: (id) => reviews[id] || null,
      saveReview,
      removeReview,
      importable: dismissed ? [] : importable,
      importLocal,
      dismissImport: () => setDismissed(true),
      statsVersion,
      openReview: (movie, focus = 'stars') => setDialog({ movie, focus }),
    }),
    [reviews, mode, useRemote, remoteReady, remote.error, saveReview, removeReview, importable, dismissed, importLocal, setDismissed, statsVersion],
  );

  return (
    <ReviewsContext.Provider value={value}>
      {children}
      {dialog && <ReviewDialog movie={dialog.movie} focus={dialog.focus} onClose={() => setDialog(null)} />}
    </ReviewsContext.Provider>
  );
}

export const useReviews = () => {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error('useReviews must be used inside ReviewsProvider');
  return ctx;
};
