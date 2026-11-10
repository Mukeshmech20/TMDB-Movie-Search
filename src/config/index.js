export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
export const IMAGE_SIZES = {
  poster: 'w342',
  posterLarge: 'w500',
  backdrop: 'w1280',
  profile: 'w185',
};

const readToken = import.meta.env.VITE_TMDB_READ_TOKEN?.trim() || '';
const apiKey = import.meta.env.VITE_TMDB_API_KEY?.trim() || '';

export const TMDB_AUTH = { readToken, apiKey };
export const IS_LIVE = Boolean(readToken || apiKey);

export const STORAGE_KEYS = {
  watchlist: 'cinescape.watchlist',
  favorites: 'cinescape.favorites',
  reviews: 'cinescape.reviews',
  recent: 'cinescape.recent',
};

export const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most popular' },
  { value: 'vote_average.desc', label: 'Highest rated' },
  { value: 'primary_release_date.desc', label: 'Newest first' },
];

export const RATING_OPTIONS = [
  { value: '', label: 'Any rating' },
  { value: '6', label: '6.0 and up' },
  { value: '7', label: '7.0 and up' },
  { value: '8', label: '8.0 and up' },
];

export const SEARCH_MIN = 2;
export const SEARCH_MAX = 100;
export const SEARCH_DEBOUNCE_MS = 400;
export const RECENT_LIMIT = 15;
