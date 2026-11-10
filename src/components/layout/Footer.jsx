import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-velvet">
      <div className="page grid gap-8 py-10 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-bold">CINE<span className="text-amber">SCAPE</span></p>
          <p className="mt-2 text-sm text-mute">Discover. Explore. Review. Repeat.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-col gap-2 text-sm">
          <Link className="text-mute hover:text-amber" to="/discover">Discover movies</Link>
          <Link className="text-mute hover:text-amber" to="/watchlist">Your watchlist</Link>
          <Link className="text-mute hover:text-amber" to="/favorites">Your favorites</Link>
        </nav>
        <p className="text-xs leading-relaxed text-mute">
          Movie data and images are provided by TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.
          Ratings and reviews you write are stored only in this browser.
        </p>
      </div>
    </footer>
  );
}
