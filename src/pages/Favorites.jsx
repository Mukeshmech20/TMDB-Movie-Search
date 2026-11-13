import { useMovies } from '../context/MovieContext';
import LibraryPage from './LibraryPage';

export default function Favorites() {
  const { favorites } = useMovies();
  return <LibraryPage title="Favorites" intro="Movies you love. Saved on this device (browser storage)." movies={favorites} emptyTitle="No favorites yet" emptyMessage="Tap the heart on any poster to keep a movie here." />;
}
