import { EmptyState } from '../components/common/States';
import MovieGrid from '../components/movies/MovieGrid';

export default function LibraryPage({ title, intro, movies, emptyTitle, emptyMessage }) {
  return (
    <div className="page py-8">
      <h1 className="text-4xl font-bold">{title}</h1>
      <p className="mt-1 text-mute">{intro}</p>
      <div className="mt-8">
        {movies.length === 0 ? (
          <EmptyState title={emptyTitle} message={emptyMessage} actionLabel="Browse movies" actionTo="/discover" />
        ) : (
          <>
            <p className="mb-4 text-sm text-mute">{movies.length} {movies.length === 1 ? 'movie' : 'movies'}</p>
            <MovieGrid movies={movies} />
          </>
        )}
      </div>
    </div>
  );
}
