import { useCallback, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { EmptyState, ErrorState } from '../components/common/States';
import { ReviewCard, useHelpfulVotes } from '../components/ratings/ReviewList';
import { useAuth } from '../context/AuthContext';
import { useReviews } from '../context/ReviewsContext';
import useAsync from '../hooks/useAsync';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { fetchFeed, fetchTopReviewers } from '../services/reviewService';

function Feed({ kind, title, subtitle, empty }) {
  const { statsVersion } = useReviews();
  const { data, error, loading, retry } = useAsync(() => fetchFeed({ kind, limit: 8 }), `${kind}:${statsVersion}`);
  const [override, setOverride] = useState({ key: '', items: null });
  const key = `${kind}:${statsVersion}`;
  const items = useMemo(() =>  override.key === key && override.items ? override.items : data || [], [override, data, key]);
  const setItems = useCallback((updater) => setOverride({ key, items: updater(items) }), [key, items]);
  const { voted, vote, userId } = useHelpfulVotes(items, setItems);
  return (
    <section aria-labelledby={`feed-${kind}`}>
      <h2 id={`feed-${kind}`} className="section-title">{title}</h2>
      <p className="text-sm text-mute">{subtitle}</p>
      <div className="mt-4">
        {error ? <ErrorState error={error} onRetry={retry} /> : loading ? <div className="skeleton h-28" /> : items.length === 0 ? <p className="stub text-sm text-mute">{empty}</p> : (
          <ul className="space-y-3">{items.map((r) => <ReviewCard key={r.id} showMovie review={r} voted={voted.has(r.id)} own={r.user_id === userId} onVote={vote} />)}</ul>
        )}
      </div>
    </section>
  );
}

export default function Community() {
  useDocumentTitle('Community', 'Top reviewers, trending reviews and the latest takes from the CINESCAPE community.');
  const { enabled } = useAuth();
  const { statsVersion } = useReviews();
  const { data: reviewers, error, loading, retry } = useAsync(() => fetchTopReviewers(10), `top:${statsVersion}`);
  if (!enabled) return <Navigate to="/" replace />;

  return (
    <div className="page py-8">
      <p className="eyebrow">CINESCAPE community</p>
      <h1 className="mt-1 text-4xl font-bold sm:text-5xl">What everyone is watching, rating and saying</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-10">
          <Feed kind="trending" title="Trending reviews" subtitle="Reviews other members found most helpful." empty="No review has been marked helpful yet. Open a movie and vote on a review you liked." />
          <Feed kind="latest" title="Latest reviews" subtitle="Fresh from the community." empty="No reviews yet. Be the first: open any movie and write one." />
        </div>
        <aside aria-labelledby="top-reviewers">
          <h2 id="top-reviewers" className="section-title">Top reviewers</h2>
          <p className="text-sm text-mute">Ranked by helpful votes, then reviews written.</p>
          <div className="mt-4">
            {error ? <ErrorState error={error} onRetry={retry} /> : loading ? <div className="skeleton h-40" /> : !reviewers?.length ? <EmptyState title="No reviewers yet" message="Rate or review a movie to appear here." actionLabel="Find a movie" actionTo="/discover" /> : (
              <ol className="stub space-y-3 !p-4">
                {reviewers.map((r, i) => (
                  <li key={r.user_id} className="flex items-center gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-curtain font-display font-bold text-gold">{i + 1}</span>
                    <div className="min-w-0 flex-1"><Link to={`/u/${r.username}`} className="block truncate font-semibold hover:text-gold">{r.display_name || r.username}</Link><p className="text-xs text-mute">{r.review_count} reviews · {r.rating_count} ratings</p></div>
                    <span className="tag-community">{r.helpful_total} helpful</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
