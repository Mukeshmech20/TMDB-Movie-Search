import { useCallback, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ErrorState } from '../components/common/States';
import { ReviewCard, useHelpfulVotes } from '../components/ratings/ReviewList';
import { useAuth } from '../context/AuthContext';
import useAsync from '../hooks/useAsync';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { fetchProfileByUsername, fetchUserReviews } from '../services/reviewService';

export default function UserProfile() {
  const { username } = useParams();
  const { enabled } = useAuth();
  useDocumentTitle(`@${username}`);
  const { data, error, loading, retry } = useAsync(async () => {
    if (!enabled) return null;
    const profile = await fetchProfileByUsername(username);
    return profile ? { profile, reviews: await fetchUserReviews(profile.id) } : { profile: null, reviews: [] };
  }, username);
  const [override, setOverride] = useState({ key: '', items: null });
  const items = useMemo(() =>  override.key === username && override.items ? override.items : data?.reviews || [], [override, data, username]);
  const setItems = useCallback((updater) => setOverride({ key: username, items: updater(items) }), [username, items]);
  const { voted, vote, userId } = useHelpfulVotes(items, setItems);

  if (!enabled) return <div className="page py-12"><p className="text-mute">Community profiles are not enabled on this deployment.</p></div>;
  if (loading) return <div className="page py-12"><div className="skeleton h-40" /></div>;
  if (error) return <div className="page py-12"><ErrorState error={error} onRetry={retry} /></div>;
  if (!data?.profile) return <div className="page py-12 text-center"><h1 className="text-3xl font-bold">No reviewer named @{username}</h1><Link to="/community" className="btn-primary mt-4">Back to community</Link></div>;
  const { profile } = data;
  const written = items.filter((r) => r.body);

  return (
    <div className="page py-10">
      <p className="eyebrow">Reviewer</p>
      <h1 className="mt-1 text-4xl font-bold">{profile.display_name || profile.username}</h1>
      <p className="text-mute">@{profile.username} · joined {new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
      {profile.bio && <p className="mt-3 max-w-2xl">{profile.bio}</p>}
      <p className="mt-3 text-sm text-mute">{items.length} {items.length === 1 ? 'rating' : 'ratings'} · {written.length} written {written.length === 1 ? 'review' : 'reviews'}</p>
      <h2 className="mt-8 text-2xl font-bold">Reviews</h2>
      {written.length === 0 ? <p className="mt-3 text-mute">No written reviews yet.</p> : (
        <ul className="mt-4 space-y-3">{written.map((r) => <ReviewCard key={r.id} showMovie review={r} voted={voted.has(r.id)} own={r.user_id === userId} onVote={vote} />)}</ul>
      )}
    </div>
  );
}
