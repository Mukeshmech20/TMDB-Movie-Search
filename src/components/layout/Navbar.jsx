import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useMovies } from '../../context/MovieContext';
import { CloseIcon, MenuIcon, SearchIcon } from '../common/Icons';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/discover', label: 'Discover' },
  { to: '/watchlist', label: 'Watchlist', countKey: 'watchlist' },
  { to: '/favorites', label: 'Favorites', countKey: 'favorites' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const library = useMovies();

  const linkClass = ({ isActive }) =>
    `flex min-h-[44px] items-center gap-2 rounded-pill px-4 text-sm font-medium transition-colors ${isActive ? 'bg-curtain text-amber' : 'text-mute hover:text-paper'}`;

  const items = LINKS.map(({ to, label, end, countKey }) => (
    <NavLink key={to} to={to} end={end} className={linkClass}>
      {label}
      {countKey && library[countKey].length > 0 && <span className="rounded-full bg-amber px-2 text-xs font-bold text-night">{library[countKey].length}</span>}
    </NavLink>
  ));

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-night/90 backdrop-blur">
      <div className="page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="font-display text-2xl font-bold tracking-wide text-paper" aria-label="CINESCAPE home">
          CINE<span className="text-amber">SCAPE</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">{items}</nav>
        <div className="flex items-center gap-2">
          <Link to="/discover?focus=search" className="btn-icon border border-line" aria-label="Search movies"><SearchIcon /></Link>
          <button type="button" className="btn-icon border border-line md:hidden" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((v) => !v)}>
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" className="page flex flex-col gap-1 border-t border-line pb-4 pt-2 md:hidden" aria-label="Mobile" onClick={() => setOpen(false)}>{items}</nav>
      )}
    </header>
  );
}
