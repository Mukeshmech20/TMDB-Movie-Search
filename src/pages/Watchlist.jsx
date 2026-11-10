import { useMovies } from '../context/MovieContext';
import LibraryPage from './LibraryPage';

export default function Watchlist() {
  const { watchlist } = useMovies();
  return <LibraryPage title="Watchlist" intro="Movies you plan to watch. Saved on this device." movies={watchlist} emptyTitle="Your watchlist is empty" emptyMessage="Tap the bookmark on any poster to save a movie for later." />;
}
