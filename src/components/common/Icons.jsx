const base = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

export const BookmarkIcon = ({ filled }) => (
  <svg {...base} fill={filled ? 'currentColor' : 'none'}><path d="M6 3h12v18l-6-4-6 4z" /></svg>
);
export const HeartIcon = ({ filled }) => (
  <svg {...base} fill={filled ? 'currentColor' : 'none'}><path d="M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11z" /></svg>
);
export const SearchIcon = () => (
  <svg {...base}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const MenuIcon = () => (
  <svg {...base}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
export const CloseIcon = () => (
  <svg {...base}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const PlayIcon = () => (
  <svg {...base} fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
);
export const ArrowUpIcon = () => (
  <svg {...base}><path d="M12 19V5M5 12l7-7 7 7" /></svg>
);
export const ChevronIcon = ({ dir = 'right' }) => (
  <svg {...base}><path d={dir === 'right' ? 'm9 6 6 6-6 6' : 'm15 6-6 6 6 6'} /></svg>
);
export const StarIcon = ({ filled }) => (
  <svg {...base} fill={filled ? 'currentColor' : 'none'}><path d="M12 2.5l2.9 6.2 6.8.8-5 4.7 1.3 6.7L12 17.5l-6 3.4 1.3-6.7-5-4.7 6.8-.8z" /></svg>
);
export const PencilIcon = () => (
  <svg {...base}><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="m13.5 6.5 4 4" /></svg>
);
export const UserIcon = () => (
  <svg {...base}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
);
export const ThumbIcon = ({ filled }) => (
  <svg {...base} fill={filled ? 'currentColor' : 'none'}><path d="M7 11v9H4v-9zM7 11l4-8c1.5 0 2.5 1 2.5 2.5V9H19a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 17.8 20H7" /></svg>
);
export const ShuffleIcon = () => (
  <svg {...base}><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" /></svg>
);
export const CheckIcon = () => (
  <svg {...base}><path d="m5 12 5 5 9-10" /></svg>
);
export const ChevronDownIcon = () => (
  <svg {...base} width={16} height={16}><path d="m6 9 6 6 6-6" /></svg>
);
export const FilmIcon = () => (
  <svg {...base}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" /></svg>
);
