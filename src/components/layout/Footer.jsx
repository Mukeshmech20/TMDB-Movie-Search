import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from './Navbar';

const col = 'flex flex-col gap-2 text-sm';
const link = 'text-mute transition-colors hover:text-gold';

export default function Footer() {
  const { enabled } = useAuth();
  return (
    <footer className="mt-20 border-t border-line bg-velvet/80">
      <div className="page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link to="/" className="text-2xl" aria-label="CINESCAPE home"><Logo /></Link>
          <p className="mt-3 font-display text-lg italic text-gold-soft">Discover. Explore. Review. Repeat.</p>
          <p className="mt-3 max-w-xs text-sm text-mute">A home for movie lovers: find something to watch, rate it in a tap and write down what it meant to you.</p>
        </div>
        <nav aria-label="Explore" className={col}>
          <p className="eyebrow mb-1">Explore</p>
          <Link className={link} to="/discover">Discover</Link>
          <Link className={link} to="/mood">Mood picker</Link>
          <Link className={link} to="/random">Random movie</Link>
          <Link className={link} to="/compare">Compare movies</Link>
          {enabled && <Link className={link} to="/community">Community</Link>}
        </nav>
        <nav aria-label="Your library" className={col}>
          <p className="eyebrow mb-1">Your library</p>
          <Link className={link} to="/watchlist">Watchlist</Link>
          <Link className={link} to="/favorites">Favorites</Link>
          <Link className={link} to="/diary">Diary & reviews</Link>
          <Link className={link} to="/stats">Statistics</Link>
        </nav>
        <div className={col}>
          <p className="eyebrow mb-1">Credits</p>
          <p className="text-xs leading-relaxed text-mute">
            Movie data and images are provided by{' '}
            <a className="text-royal-soft underline" href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer">TMDB</a>. This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
          <p className="text-xs leading-relaxed text-mute">
            {enabled ? 'Community ratings and reviews are stored with Supabase.' : 'Ratings and reviews are stored in this browser.'}
          </p>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-mute">&copy; {new Date().getFullYear()} CINESCAPE. Built for movie lovers with React, Vite and Tailwind.</div>
    </footer>
  );
}
