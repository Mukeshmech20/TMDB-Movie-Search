import { TMDB_BASE_URL, TMDB_AUTH, USE_TMDB_PROXY } from '../config';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const MAX_RETRIES = 2;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const buildUrl = (path, params) => {
  const url = USE_TMDB_PROXY ? new URL(`/api/tmdb${path}`, window.location.origin) : new URL(`${TMDB_BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
  });
  if (!USE_TMDB_PROXY && !TMDB_AUTH.readToken && TMDB_AUTH.apiKey) url.searchParams.set('api_key', TMDB_AUTH.apiKey);
  return url;
};

/** Central TMDB request: auth, abort support and 429 back-off. */
export async function tmdbGet(path, params = {}, { signal } = {}) {
  const headers = { Accept: 'application/json' };
  if (!USE_TMDB_PROXY && TMDB_AUTH.readToken) headers.Authorization = `Bearer ${TMDB_AUTH.readToken}`;

  for (let attempt = 0; ; attempt += 1) {
    let response;
    try {
      response = await fetch(buildUrl(path, { language: 'en-US', ...params }), { headers, signal });
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      throw new ApiError('Network error. Check your connection and try again.', 0);
    }

    if (response.status === 429 && attempt < MAX_RETRIES) {
      const retryAfter = Number(response.headers.get('Retry-After')) || 1;
      await wait(Math.min(retryAfter, 5) * 1000);
      continue;
    }
    if (response.status === 401) throw new ApiError('TMDB rejected your credentials. Check the TMDB credentials in your environment.', 401);
    if (response.status === 404) throw new ApiError('That item could not be found on TMDB.', 404);
    if (response.status === 429) throw new ApiError('TMDB is rate limiting requests. Wait a moment and retry.', 429);
    if (!response.ok) throw new ApiError(`TMDB responded with an error (${response.status}).`, response.status);

    return response.json();
  }
}
