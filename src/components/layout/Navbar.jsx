import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMovies } from '../../context/MovieContext';
import Dropdown, { menuItemClass } from '../common/Dropdown';
import { CloseIcon, FilmIcon, MenuIcon, SearchIcon, UserIcon } from '../common/Icons';

const EXPLORE = [
  { to: '/mood', label: 'Mood picker' },
  { to: '/random', label: 'Random movie' },
  { to: '/compare', label: 'Compare movies' },
];
const LIBRARY = [
  { to: '/watchlist', label: 'Watchlist', count: 'watchlist' },
  { to: '/favorites', label: 'Favorites', count: 'favorites' },
  { to: '/diary', label: 'Diary & reviews' },
  { to: '/stats', label: 'My statistics' },
];

export function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display font-bold tracking-wide ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-gold-soft to-royal text-night shadow-gold"><FilmIcon /></span>
      <span>CINE<span className="brand-gradient">SCAPE</span></span>
    </span>
  );
}

const topLink = ({ isActive }) =>
  `flex min-h-[44px] items-center rounded-pill px-4 text-sm font-medium transition-colors ${isActive ? 'bg-curtain text-gold' : 'text-mute hover:text-paper'}`;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const library = useMovies();
  const { enabled, user, profile, signOut, loading } = useAuth();
  const total = library.watchlist.length + library.favorites.length;

  const search = (event) => {
    event.preventDefault();
    const q = query.trim();
    navigate(q ? `/discover?q=${encodeURIComponent(q)}` : '/discover?focus=search');
    setQuery('');
    setOpen(false);
  };

  const searchForm = (idSuffix, className) => (
    <form role="search" onSubmit={search} className={className}>
      <label htmlFor={`nav-search-${idSuffix}`} className="sr-only">Search movies</label>
      <input id={`nav-search-${idSuffix}`} className="field !min-h-[40px] !rounded-pill pl-4 pr-11" placeholder="Search movies" value={query} maxLength={100} onChange={(e) => setQuery(e.target.value)} />
      <button type="submit" className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-mute hover:text-gold" aria-label="Search"><SearchIcon /></button>
    </form>
  );

  const authArea = !enabled ? null : loading ? null : user ? (
    <Dropdown align="right" label={<span className="max-w-[10ch] truncate">{profile?.username || 'Account'}</span>} icon={<UserIcon />} buttonClass="border border-line">
      <Link to="/profile" className={menuItemClass}>My profile</Link>
      <Link to="/diary" className={menuItemClass}>My reviews</Link>
      <button type="button" className={menuItemClass} onClick={() => signOut().then(() => navigate('/'))}>Sign out</button>
    </Dropdown>
  ) : (
    <Link to="/auth" className="btn-primary !min-h-[40px]">Sign in</Link>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-night/85 backdrop-blur-xl">
      <div className="page flex h-16 items-center justify-between gap-3">
        <Link to="/" aria-label="CINESCAPE home" className="shrink-0 text-xl text-paper sm:text-2xl"><Logo /></Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          <NavLink to="/" end className={topLink}>Home</NavLink>
          <NavLink to="/discover" className={topLink}>Discover</NavLink>
          <Dropdown label="Explore">
            {EXPLORE.map((i) => <Link key={i.to} to={i.to} className={menuItemClass}>{i.label}</Link>)}
          </Dropdown>
          {enabled && <NavLink to="/community" className={topLink}>Community</NavLink>}
          <Dropdown label={<>Library{total > 0 && <span className="rounded-full bg-gold px-2 text-xs font-bold text-night">{total}</span>}</>}>
            {LIBRARY.map((i) => (
              <Link key={i.to} to={i.to} className={menuItemClass}>{i.label}{i.count && library[i.count].length > 0 && <span className="rounded-full bg-curtain px-2 text-xs text-gold">{library[i.count].length}</span>}</Link>
            ))}
          </Dropdown>
        </nav>

        <div className="flex items-center gap-2">
          {searchForm('desktop', 'relative hidden w-52 xl:block')}
          <Link to="/discover?focus=search" className="btn-icon border border-line xl:hidden" aria-label="Search movies"><SearchIcon /></Link>
          <div className="hidden md:block">{authArea}</div>
          <button type="button" className="btn-icon border border-line md:hidden" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((v) => !v)}>
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" className="page max-h-[80vh] space-y-3 overflow-y-auto border-t border-line pb-5 pt-3 md:hidden" aria-label="Mobile" onClick={(e) => e.target.closest('a') && setOpen(false)}>
          {searchForm('mobile', 'relative')}
          <div className="grid grid-cols-2 gap-1">
            <NavLink to="/" end className={topLink}>Home</NavLink>
            <NavLink to="/discover" className={topLink}>Discover</NavLink>
            {enabled && <NavLink to="/community" className={topLink}>Community</NavLink>}
            {EXPLORE.map((i) => <NavLink key={i.to} to={i.to} className={topLink}>{i.label}</NavLink>)}
          </div>
          <p className="eyebrow pt-2">Your library</p>
          <div className="grid grid-cols-2 gap-1">
            {LIBRARY.map((i) => <NavLink key={i.to} to={i.to} className={topLink}>{i.label}{i.count && library[i.count].length > 0 ? ` (${library[i.count].length})` : ''}</NavLink>)}
          </div>
          {authArea && <div className="flex flex-wrap items-center gap-2 pt-2">{user ? (<><NavLink to="/profile" className={topLink}>Profile ({profile?.username || 'account'})</NavLink><button type="button" className="btn-ghost" onClick={() => { setOpen(false); signOut().then(() => navigate('/')); }}>Sign out</button></>) : authArea}</div>}
        </nav>
      )}
    </header>
  );
}
