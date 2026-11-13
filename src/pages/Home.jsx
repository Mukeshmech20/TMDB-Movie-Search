import { Link } from 'react-router-dom';
import { ErrorState } from '../components/common/States';
import Hero from '../components/movies/Hero';
import MovieOfTheDay from '../components/movies/MovieOfTheDay';
import MovieRow, { Carousel } from '../components/movies/MovieRow';
import { useAuth } from '../context/AuthContext';
import { useMovies } from '../context/MovieContext';
import useAsync from '../hooks/useAsync';
import useDocumentTitle from '../hooks/useDocumentTitle';
import useGenres from '../hooks/useGenres';
import { discoverMovies, getPopular, getTopRated, getTrending, getUpcoming } from '../services/movieService';

const fetchPopular = (signal) => getPopular(1, { signal });
const fetchTopRated = (signal) => getTopRated(1, { signal });
const fetchUpcoming = (signal) => getUpcoming(1, { signal });
const fetchTrending = (signal) => getTrending(1, { signal });
const collection = (genre, extra = {}) => (signal) => discoverMovies({ genre, rating: '7', sort: 'popularity.desc', ...extra }, { signal });
const fetchSciFi = collection('878');
const fetchComedy = collection('35');
const fetchFamily = collection('16|10751');
const fetchThriller = collection('53|9648');

export default function Home() {
  useDocumentTitle();
  const { data, error, retry } = useAsync(fetchTrending, 'trending');
  const { genres } = useGenres();
  const { recent } = useMovies();
  const { enabled } = useAuth();

  const trending = data?.results?.filter((m) => m.title) || null;
  const featured = trending?.find((m) => m.backdrop_path) || trending?.[0];

  return (
    <>
      {featured ? <Hero movie={featured} /> : !error && <div className="skeleton h-[460px] rounded-none sm:h-[580px]" aria-hidden="true" />}

      <section className="page -mt-6 grid gap-3 sm:grid-cols-3" aria-label="Quick actions">
        <Link to="/discover" className="stub transition-colors hover:border-gold"><p className="eyebrow">Search</p><p className="mt-1 font-semibold">Discover by genre, year and language</p></Link>
        <Link to="/mood" className="stub transition-colors hover:border-gold"><p className="eyebrow">Mood</p><p className="mt-1 font-semibold">Tell us how you feel, get a shortlist</p></Link>
        <Link to="/random" className="stub transition-colors hover:border-gold"><p className="eyebrow">Surprise me</p><p className="mt-1 font-semibold">Let fate pick tonight&apos;s movie</p></Link>
      </section>

      <MovieOfTheDay />

      {error ? <ErrorState error={error} onRetry={retry} /> : <Carousel title="Trending this week" subtitle="Rate any movie right from its card" movies={trending} seeAllTo="/discover" />}
      <MovieRow title="Popular" fetcher={fetchPopular} fetchKey="popular" seeAllTo="/discover?sort=popularity.desc" />
      <MovieRow title="Top rated" subtitle="Highest-voted movies of all time on TMDB" fetcher={fetchTopRated} fetchKey="top" seeAllTo="/discover?sort=vote_average.desc" />
      {recent.length > 0 && <Carousel title="Recently viewed" movies={recent} />}
      <MovieRow title="Coming soon" subtitle="Upcoming releases" fetcher={fetchUpcoming} fetchKey="upcoming" />

      <section className="page mt-12" aria-label="Browse by genre">
        <h2 className="section-title">Explore by genre</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {genres.map((g) => <Link key={g.id} to={`/discover?genre=${g.id}`} className="chip px-4">{g.name}</Link>)}
        </div>
      </section>

      <MovieRow title="Collection: well-reviewed sci-fi" subtitle="Science fiction rated 7.0 and above" fetcher={fetchSciFi} fetchKey="sci" seeAllTo="/discover?genre=878&rating=7" />
      <MovieRow title="Collection: comedies worth the laughs" subtitle="Comedies rated 7.0 and above" fetcher={fetchComedy} fetchKey="com" seeAllTo="/discover?genre=35&rating=7" />
      <MovieRow title="Collection: animation & family nights" subtitle="Animation and family films rated 7.0 and above" fetcher={fetchFamily} fetchKey="fam" seeAllTo="/discover?genre=16%7C10751&rating=7" />
      <MovieRow title="Collection: edge-of-your-seat" subtitle="Thrillers and mysteries rated 7.0 and above" fetcher={fetchThriller} fetchKey="thr" seeAllTo="/discover?genre=53%7C9648&rating=7" />

      {enabled && (
        <section className="page mt-12">
          <div className="stub flex flex-wrap items-center justify-between gap-4 border-gold/40">
            <div><h2 className="text-2xl font-bold">See what the community is saying</h2><p className="text-sm text-mute">Trending reviews, top reviewers and the latest takes.</p></div>
            <Link to="/community" className="btn-primary">Open community</Link>
          </div>
        </section>
      )}
    </>
  );
}
