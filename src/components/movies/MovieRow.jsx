import { useRef } from 'react';
import { Link } from 'react-router-dom';
import useAsync from '../../hooks/useAsync';
import { ChevronIcon } from '../common/Icons';
import { ErrorState, PosterSkeletons } from '../common/States';
import MovieCard from './MovieCard';

/** Horizontal carousel. Pass `fetcher(signal)` to load, or `movies` for ready data. */
export function Carousel({ title, subtitle, movies, seeAllTo }) {
  const scroller = useRef(null);
  const scrollBy = (dir) => scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth * 0.8, behavior: 'smooth' });

  return (
    <section className="page mt-12" aria-label={title}>
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="text-sm text-mute">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {seeAllTo && <Link to={seeAllTo} className="btn-ghost hidden sm:inline-flex">See all</Link>}
          <button type="button" className="btn-icon hidden border border-line sm:inline-flex" aria-label={`Scroll ${title} left`} onClick={() => scrollBy(-1)}><ChevronIcon dir="left" /></button>
          <button type="button" className="btn-icon hidden border border-line sm:inline-flex" aria-label={`Scroll ${title} right`} onClick={() => scrollBy(1)}><ChevronIcon /></button>
        </div>
      </div>
      <div ref={scroller} className="row-scroll">
        {movies ? movies.map((m) => <MovieCard key={m.id} movie={m} />) : <PosterSkeletons />}
      </div>
    </section>
  );
}

export default function MovieRow({ title, subtitle, fetcher, fetchKey, seeAllTo }) {
  const { data, error, loading, retry } = useAsync(fetcher, fetchKey);

  if (error) return <section className="page mt-12"><h2 className="section-title">{title}</h2><ErrorState error={error} onRetry={retry} /></section>;
  const movies = !loading && data ? (data.results || data).filter((m) => m.title) : null;
  if (movies && movies.length === 0) return null;
  return <Carousel title={title} subtitle={subtitle} movies={movies} seeAllTo={seeAllTo} />;
}
