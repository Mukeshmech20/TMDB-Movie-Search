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

// Preferred in production: the browser calls /api/tmdb and a serverless function adds the secret
// (see api/tmdb/[...path].js). Direct mode (VITE_TMDB_*) ships the credential in the public bundle.
export const USE_TMDB_PROXY = import.meta.env.VITE_TMDB_PROXY === 'true';
export const TMDB_AUTH = { readToken, apiKey };
export const IS_LIVE = USE_TMDB_PROXY || Boolean(readToken || apiKey);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';
export const SUPABASE = { url: supabaseUrl, anonKey: supabaseAnonKey };
/** True only when a project URL and the public anon key are present. Never put a service-role key here. */
export const IS_COMMUNITY_ENABLED = Boolean(supabaseUrl && supabaseAnonKey);

export const STORAGE_KEYS = {
  watchlist: 'cinescape.watchlist',
  favorites: 'cinescape.favorites',
  reviews: 'cinescape.reviews',
  recent: 'cinescape.recent',
  diary: 'cinescape.diary',
  importDismissed: 'cinescape.importDismissed',
};

export const REVIEW_MIN = 10;
export const REVIEW_MAX = 1000;
export const PAGE_SIZE = 20;

export const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most popular' },
  { value: 'vote_average.desc', label: 'Highest rated' },
  { value: 'primary_release_date.desc', label: 'Newest first' },
  { value: 'primary_release_date.asc', label: 'Oldest first' },
  { value: 'vote_count.desc', label: 'Most voted' },
];

export const LANGUAGE_OPTIONS = [
  { value: '', label: 'Any language' },
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'ta', label: 'Tamil' },
  { value: 'te', label: 'Telugu' },
  { value: 'ml', label: 'Malayalam' },
  { value: 'ko', label: 'Korean' },
  { value: 'ja', label: 'Japanese' },
  { value: 'fr', label: 'French' },
  { value: 'es', label: 'Spanish' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'zh', label: 'Chinese' },
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
