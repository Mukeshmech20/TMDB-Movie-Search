import { useEffect, useState } from 'react';
import { IS_COMMUNITY_ENABLED } from '../config';
import { useReviews } from '../context/ReviewsContext';
import { getCommunityStats } from '../services/reviewService';

/** CINESCAPE community aggregate for one movie: { average (0-5), ratings, reviews } or null when unavailable. */
export default function useCommunityStats(movieId) {
  const { statsVersion } = useReviews();
  const [state, setState] = useState({ id: null, data: null });

  useEffect(() => {
    if (!IS_COMMUNITY_ENABLED || !movieId) return undefined;
    let cancelled = false;
    getCommunityStats(movieId)
      .then((data) => !cancelled && setState({ id: movieId, data }))
      .catch(() => !cancelled && setState({ id: movieId, data: null }));
    return () => {
      cancelled = true;
    };
  }, [movieId, statsVersion]);

  return state.id === movieId ? state.data : null;
}
