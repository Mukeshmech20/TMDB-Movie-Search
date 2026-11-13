import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ErrorState } from '../components/common/States';
import { PlayIcon } from '../components/common/Icons';
import Poster from '../components/common/Poster';
import { Carousel } from '../components/movies/MovieRow';
import TrailerModal from '../components/movies/TrailerModal';
import RatingPanels from '../components/ratings/RatingPanels';
import ReviewList from '../components/ratings/ReviewList';
import { useMovies } from '../context/MovieContext';
import { useReviews } from '../context/ReviewsContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { BookmarkIcon, HeartIcon, StarIcon } from '../components/common/Icons';
import useAsync from '../hooks/useAsync';
import { formatDate, formatMoney, formatRuntime, getYear, languageName } from '../utils/format';
import { getMovieDetails } from '../services/movieService';

function DetailsSkeleton() {
  return (
    <div className="page py-10" aria-label="Loading movie details" aria-busy="true">
      <div className="grid gap-8 md:grid-cols-[280px_1fr]">
        <div className="skeleton aspect-[2/3]" />
        <div className="space-y-4"><div className="skeleton h-10 w-2/3" /><div className="skeleton h-5 w-1/3" /><div className="skeleton h-32 w-full" /></div>
      </div>
    </div>
  );
}

const Fact = ({ label, value }) => (value ? (
  <div><dt className="text-xs text-mute">{label}</dt><dd className="font-medium">{value}</dd></div>
) : null);

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: movie, error, loading, retry } = useAsync((signal) => getMovieDetails(id, { signal }), id);
  const { inWatchlist, isFavorite, toggleWatchlist, toggleFavorite, addRecent, inDiary, logWatched, unlogWatched } = useMovies();
  const { openReview, myReview } = useReviews();
  const [trailer, setTrailer] = useState(null);
  useDocumentTitle(movie ? `${movie.title}${getYear(movie.release_date) ? ` (${getYear(movie.release_date)})` : ''}` : 'Movie', movie?.overview?.slice(0, 160));

  useEffect(() => {
    if (movie) addRecent(movie);
  }, [movie, addRecent]);

  const goBack = () => (location.key !== 'default' ? navigate(-1) : navigate('/discover'));

  if (loading) return <DetailsSkeleton />;
  if (error) {
    return (
      <div className="page py-10">
        <ErrorState error={error} onRetry={error.status === 404 ? undefined : retry} />
        <div className="flex justify-center"><Link to="/discover" className="btn-ghost">Back to Discover</Link></div>
      </div>
    );
  }
  if (!movie) return null;

  const crew = movie.credits?.crew || [];
  const cast = (movie.credits?.cast || []).slice(0, 12);
  const directors = crew.filter((c) => c.job === 'Director').map((c) => c.name).join(', ');
  const videos = (movie.videos?.results || []).filter((v) => v.site === 'YouTube');
  const mainTrailer = videos.find((v) => v.type === 'Trailer') || videos[0];
  const companies = (movie.production_companies || []).map((c) => c.name).join(', ');
  const related = (movie.recommendations?.results || []).filter((m) => m.title);
  const similar = (movie.similar?.results || []).filter((m) => m.title);
  const saved = inWatchlist(movie.id);
  const loved = isFavorite(movie.id);
  const mine = myReview(movie.id);
  const watched = inDiary(movie.id);

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-line">
        {movie.backdrop_path && <Poster path={movie.backdrop_path} title={movie.title} kind="backdrop" className="absolute inset-0 -z-20 h-full w-full opacity-60" />}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-night via-night/80 to-night/40" />
        <div className="page py-8 sm:py-12">
          <button type="button" className="btn-ghost mb-6" onClick={goBack}>Back</button>
          <div className="grid gap-8 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr]">
            <Poster path={movie.poster_path} title={movie.title} kind="posterLarge" className="mx-auto aspect-[2/3] w-56 rounded-poster shadow-poster md:w-full" />
            <div>
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl">{movie.title}{getYear(movie.release_date) && <span className="text-mute"> ({getYear(movie.release_date)})</span>}</h1>
              {movie.tagline && <p className="mt-2 font-display text-lg italic text-gold">{movie.tagline}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                {formatRuntime(movie.runtime) && <span className="badge">{formatRuntime(movie.runtime)}</span>}
                {(movie.genres || []).map((g) => <Link key={g.id} className="chip" to={`/discover?genre=${g.id}`}>{g.name}</Link>)}
              </div>
              <p className="mt-5 max-w-2xl leading-relaxed">{movie.overview || 'No synopsis is available for this movie yet.'}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                {mainTrailer && <button type="button" className="btn-primary" onClick={() => setTrailer(mainTrailer)}><PlayIcon /> Watch trailer</button>}
                <button type="button" className="btn-royal" onClick={() => openReview(movie, 'stars')}><StarIcon filled={Boolean(mine)} /> {mine ? `Your rating: ${mine.rating}` : 'Rate this movie'}</button>
                <button type="button" className="btn-ghost" onClick={() => openReview(movie, 'text')}>{mine?.text ? 'Edit review' : 'Write a review'}</button>
                <button type="button" className="btn-ghost" aria-pressed={saved} onClick={() => toggleWatchlist(movie)}><BookmarkIcon filled={saved} /> {saved ? 'In watchlist' : 'Watchlist'}</button>
                <button type="button" className="btn-ghost" aria-pressed={loved} onClick={() => toggleFavorite(movie)}><HeartIcon filled={loved} /> {loved ? 'Favorited' : 'Favorite'}</button>
                <button type="button" className="btn-ghost" aria-pressed={watched} onClick={() => (watched ? unlogWatched(movie) : logWatched(movie))}>{watched ? 'Watched (in diary)' : 'Log as watched'}</button>
                <Link to={`/compare?a=${movie.id}`} className="btn-ghost">Compare</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="page mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <section aria-labelledby="facts">
            <h2 id="facts" className="text-2xl font-bold">Details</h2>
            <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Fact label="Director" value={directors} />
              <Fact label="Release date" value={formatDate(movie.release_date)} />
              <Fact label="Original language" value={languageName(movie.original_language)} />
              <Fact label="Budget" value={formatMoney(movie.budget)} />
              <Fact label="Revenue" value={formatMoney(movie.revenue)} />
              <Fact label="Production" value={companies} />
            </dl>
            {!directors && !companies && <p className="mt-3 text-sm text-mute">Extended credits are not available in demo mode or for this title.</p>}
          </section>

          {cast.length > 0 && (
            <section aria-labelledby="cast">
              <h2 id="cast" className="text-2xl font-bold">Cast</h2>
              <ul className="row-scroll mt-4">
                {cast.map((person) => (
                  <li key={person.credit_id || person.id} className="w-28 shrink-0 snap-start">
                    <Poster path={person.profile_path} title={person.name} kind="profile" className="aspect-[2/3] w-full rounded-poster" />
                    <p className="mt-2 text-sm font-semibold leading-tight">{person.name}</p>
                    <p className="text-xs text-mute">{person.character}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {videos.length > 0 && (
            <section aria-labelledby="videos">
              <h2 id="videos" className="text-2xl font-bold">Videos</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {videos.slice(0, 8).map((v) => (
                  <li key={v.id}><button type="button" className="chip" onClick={() => setTrailer(v)}><PlayIcon /> {v.name}</button></li>
                ))}
              </ul>
            </section>
          )}
          <ReviewList movie={movie} />
        </div>

        <aside aria-label="Ratings"><RatingPanels movie={movie} /></aside>
      </div>

      {related.length > 0 && <Carousel title="Recommended for you" subtitle={`If you liked ${movie.title}`} movies={related} />}
      {similar.length > 0 && <Carousel title="Similar movies" movies={similar} />}
      {trailer && <TrailerModal video={trailer} title={movie.title} onClose={() => setTrailer(null)} />}
    </>
  );
}
