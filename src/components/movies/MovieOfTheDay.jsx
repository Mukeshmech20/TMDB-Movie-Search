import { Link } from 'react-router-dom';
import useAsync from '../../hooks/useAsync';
import { getTopRated } from '../../services/movieService';
import { explainPick, pickMovieOfTheDay } from '../../utils/movieOfTheDay';
import { formatRating, getYear } from '../../utils/format';
import { useReviews } from '../../context/ReviewsContext';
import Poster from '../common/Poster';

const fetchPool = async (signal) => {
  const [a, b] = await Promise.all([getTopRated(1, { signal }), getTopRated(2, { signal })]);
  return [...(a.results || []), ...(b.results || [])];
};

export default function MovieOfTheDay() {
  const { data } = useAsync(fetchPool, 'motd');
  const { openReview } = useReviews();
  const pick = data ? pickMovieOfTheDay(data) : null;
  if (!data) return <section className="page mt-12"><div className="skeleton h-56" aria-hidden="true" /></section>;
  if (!pick) return null;
  const { movie } = pick;

  return (
    <section className="page mt-12" aria-labelledby="motd-title">
      <div className="relative overflow-hidden rounded-poster border border-gold/40 bg-gradient-to-br from-curtain via-velvet to-night p-5 shadow-gold sm:p-8">
        <div className="grid items-center gap-6 sm:grid-cols-[170px_1fr]">
          <Link to={`/movie/${movie.id}`} aria-label={`Open ${movie.title}`} className="mx-auto block w-40 sm:w-full">
            <Poster path={movie.poster_path} title={movie.title} className="aspect-[2/3] w-full rounded-poster shadow-poster" />
          </Link>
          <div>
            <p className="eyebrow">Movie of the Day</p>
            <h2 id="motd-title" className="mt-1 text-3xl font-bold sm:text-4xl">{movie.title} <span className="text-mute">({getYear(movie.release_date)})</span></h2>
            <p className="mt-2"><span className="tag-tmdb">TMDB {formatRating(movie.vote_average)} / 10</span></p>
            <p className="mt-3 line-clamp-3 max-w-2xl text-paper/90">{movie.overview}</p>
            <p className="mt-3 max-w-2xl rounded-poster border border-line bg-night/60 p-3 text-xs leading-relaxed text-mute"><strong className="text-paper">Why this movie?</strong> {explainPick(pick)}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to={`/movie/${movie.id}`} className="btn-primary">See details</Link>
              <button type="button" className="btn-ghost" onClick={() => openReview(movie, 'stars')}>Rate it</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
