import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Discover from './pages/Discover';
import Favorites from './pages/Favorites';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import NotFound from './pages/NotFound';
import Watchlist from './pages/Watchlist';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="discover" element={<Discover />} />
        <Route path="movie/:id" element={<MovieDetails />} />
        <Route path="watchlist" element={<Watchlist />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
