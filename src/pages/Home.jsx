import { Link } from 'react-router-dom';
import { Carousel } from '../components/movies/MovieRow';
import Hero from '../components/movies/Hero';
import MovieRow from '../components/movies/MovieRow';
import { ErrorState } from '../components/common/States';
import { useMovies } from '../context/MovieContext';
import useAsync from '../hooks/useAsync';
import useGenres from '../hooks/useGenres';
import { discoverMovies, getNowPlaying, getPopular, getTopRated, getTrending, getUpcoming } from '../services/movieService';

const fetchPopular = (signal) => getPopular(1, { signal });
const fetchTopRated = (signal) => getTopRated(1, { signal });
const fetchNowPlaying = (signal) => getNowPlaying(1, { signal });
const fetchUpcoming = (signal) => getUpcoming(1, { signal });
const fetchSciFi = (signal) => discoverMovies({ genre: '878', rating: '7', sort: 'popularity.desc' }, { signal });
const fetchComedy = (signal) => discoverMovies({ genre: '35', rating: '7', sort: 'popularity.desc' }, { signal });
const fetchTrending = (signal) => getTrending(1, { signal });

export default function Home() {
  const { data, error, retry } = useAsync(fetchTrending, 'trending');
  const { genres } = useGenres();
  const { recent } = useMovies();

  const trending = data?.results?.filter((m) => m.title) || null;
  const featured = trending?.find((m) => m.backdrop_path) || trending?.[0];

  return (
    <>
      {featured ? <Hero movie={featured} /> : !error && <div className="skeleton h-[420px] rounded-none sm:h-[520px]" aria-hidden="true" />}
      {error ? <ErrorState error={error} onRetry={retry} /> : <Carousel title="Trending this week" subtitle="What everyone is watching right now" movies={trending} seeAllTo="/discover" />}
      <MovieRow title="Popular" fetcher={fetchPopular} fetchKey="popular" seeAllTo="/discover?sort=popularity.desc" />
      <MovieRow title="Top rated" subtitle="Highest-voted movies of all time" fetcher={fetchTopRated} fetchKey="top" seeAllTo="/discover?sort=vote_average.desc" />
      {recent.length > 0 && <Carousel title="Recently viewed" movies={recent} />}
      <MovieRow title="Now playing" fetcher={fetchNowPlaying} fetchKey="now" />
      <MovieRow title="Coming soon" fetcher={fetchUpcoming} fetchKey="upcoming" />

      <section className="page mt-12" aria-label="Browse by genre">
        <h2 className="section-title">Explore by genre</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {genres.map((g) => <Link key={g.id} to={`/discover?genre=${g.id}`} className="chip px-4">{g.name}</Link>)}
        </div>
      </section>

      <MovieRow title="Collection: well-reviewed sci-fi" subtitle="Science fiction rated 7.0 and above" fetcher={fetchSciFi} fetchKey="sci" seeAllTo="/discover?genre=878&rating=7" />
      <MovieRow title="Collection: comedies worth the laughs" subtitle="Comedies rated 7.0 and above" fetcher={fetchComedy} fetchKey="com" seeAllTo="/discover?genre=35&rating=7" />
    </>
  );
}
