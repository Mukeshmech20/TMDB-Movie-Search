import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../components/common/States';
import { useMovies } from '../context/MovieContext';
import { useReviews } from '../context/ReviewsContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import useGenres from '../hooks/useGenres';
import { computeStats } from '../utils/stats';

const Tile = ({ label, value, hint }) => (
  <div className="stub !p-4"><p className="text-xs text-mute">{label}</p><p className="mt-1 font-display text-4xl font-bold text-gold">{value}</p>{hint && <p className="text-xs text-mute">{hint}</p>}</div>
);

export default function Stats() {
  useDocumentTitle('My statistics');
  const { diary, favorites } = useMovies();
  const { reviews } = useReviews();
  const { nameOf } = useGenres();
  const stats = useMemo(() => computeStats({ diary, reviews, favorites }), [diary, reviews, favorites]);
  const max = Math.max(1, ...Object.values(stats.distribution));

  return (
    <div className="page py-8">
      <p className="eyebrow">Personal statistics</p>
      <h1 className="mt-1 text-4xl font-bold sm:text-5xl">Your movie year in numbers</h1>
      {stats.watched === 0 ? (
        <EmptyState title="No statistics yet" message="Rate a few movies or log what you have watched and your numbers appear here." actionLabel="Find a movie" actionTo="/discover" />
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
            <Tile label="Watched" value={stats.watched} />
            <Tile label="Rated" value={stats.rated} />
            <Tile label="Reviews written" value={stats.reviewed} />
            <Tile label="Favorites" value={stats.favorites} />
            <Tile label="Your average" value={stats.rated ? stats.average.toFixed(2) : '-'} hint="out of 5" />
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <section className="stub" aria-labelledby="dist">
              <h2 id="dist" className="text-xl font-bold">Rating distribution</h2>
              {stats.rated === 0 ? <p className="mt-2 text-sm text-mute">Rate a movie to see your distribution.</p> : (
                <ul className="mt-4 space-y-1.5">
                  {Object.entries(stats.distribution).reverse().map(([star, n]) => (
                    <li key={star} className="flex items-center gap-2 text-xs">
                      <span className="w-8 text-right text-mute">{star}</span>
                      <span className="h-3 flex-1 overflow-hidden rounded-full bg-curtain"><span className="block h-full rounded-full bg-gradient-to-r from-royal to-gold" style={{ width: `${(n / max) * 100}%` }} /></span>
                      <span className="w-5 text-mute">{n}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className="stub" aria-labelledby="genres">
              <h2 id="genres" className="text-xl font-bold">Favourite genres</h2>
              {stats.topGenres.length === 0 ? <p className="mt-2 text-sm text-mute">Genre data appears once you rate or log movies.</p> : (
                <ol className="mt-4 space-y-2">{stats.topGenres.map((g, i) => <li key={g.id} className="flex items-center justify-between rounded-lg bg-curtain px-3 py-2 text-sm"><span>{i + 1}. {nameOf(g.id) || `Genre ${g.id}`}</span><span className="text-gold">{g.count} {g.count === 1 ? 'movie' : 'movies'}</span></li>)}</ol>
              )}
              {stats.topDecade && <p className="mt-4 text-sm text-mute">Most watched decade: <strong className="text-paper">{stats.topDecade.decade}</strong> ({stats.topDecade.count})</p>}
            </section>
          </div>
          {stats.highest.length > 0 && (
            <p className="mt-6 text-sm text-mute">Your top-rated: {stats.highest.map((m, i) => <span key={m.id}>{i > 0 && ', '}<Link to={`/movie/${m.id}`} className="text-gold hover:underline">{m.title}</Link></span>)}</p>
          )}
        </>
      )}
    </div>
  );
}
