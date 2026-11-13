import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import NotFound from './pages/NotFound';

const Discover = lazy(() => import('./pages/Discover'));
const MovieDetails = lazy(() => import('./pages/MovieDetails'));
const Watchlist = lazy(() => import('./pages/Watchlist'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Diary = lazy(() => import('./pages/Diary'));
const Stats = lazy(() => import('./pages/Stats'));
const Compare = lazy(() => import('./pages/Compare'));
const Mood = lazy(() => import('./pages/Mood'));
const Random = lazy(() => import('./pages/Random'));
const Community = lazy(() => import('./pages/Community'));
const Auth = lazy(() => import('./pages/Auth'));
const Profile = lazy(() => import('./pages/Profile'));
const UserProfile = lazy(() => import('./pages/UserProfile'));

const Loading = () => <div className="page py-16" role="status" aria-label="Loading page"><div className="skeleton h-64" /></div>;

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="discover" element={<Discover />} />
          <Route path="movie/:id" element={<MovieDetails />} />
          <Route path="watchlist" element={<Watchlist />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="diary" element={<Diary />} />
          <Route path="stats" element={<Stats />} />
          <Route path="compare" element={<Compare />} />
          <Route path="mood" element={<Mood />} />
          <Route path="random" element={<Random />} />
          <Route path="community" element={<Community />} />
          <Route path="auth" element={<Auth />} />
          <Route path="profile" element={<Profile />} />
          <Route path="u/:username" element={<UserProfile />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
