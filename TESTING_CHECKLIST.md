# Testing checklist

Results below come from checks actually executed during development (headless Chromium via Playwright, Node 22). Items marked **Not tested** were not run.

## Static and build

- [x] `npm install` succeeds
- [x] `npm run lint` passes with `--max-warnings 0`
- [x] `npm run build` succeeds (Tailwind config and all imports resolve)
- [x] Dev server starts; production preview serves `/` and deep links such as `/movie/603` (HTTP 200)

## Demo mode (38 automated checks)

- [x] Routes: home, discover, details deep link, watchlist, favorites, 404, unknown movie id error state
- [x] Search filters results; no-results state; 1-character validation message
- [x] Genre, rating, year filters individually and combined; clear single filter; clear all; sort; filters survive refresh
- [x] Star rating: click sets value, keyboard half-step, persists after reload; review validation, save, persist, delete
- [x] Watchlist and favorites toggling, pages, empty states, no duplicates; recently viewed row
- [x] No horizontal overflow at 375px on 4 pages; mobile menu opens and closes after navigation
- [x] No console errors or warnings, including React development warnings (suite also run against the Vite dev server in StrictMode; blocked Google Fonts requests in the sandbox ignored)

## Live-API code path (18 automated checks, TMDB responses mocked)

The sandbox cannot reach TMDB, so requests to `api.themoviedb.org` were intercepted and answered with mock data. This verifies request construction and UI behaviour, not TMDB's real responses.

- [x] Bearer header sent; image URLs built with the correct size; demo banner hidden
- [x] 429 retried then succeeds; 500 shows error state and Try again recovers
- [x] Discover query parameters; Load more appends page 2 and hides at the last page
- [x] Search endpoint and debounce (rapid typing yields one request)
- [x] Details: single appended request, director, budget, revenue, companies, votes, language, runtime, cast, recommended, similar, trailer modal, Escape closes

## Not tested

- Real TMDB responses with a real key; real image loading; real YouTube playback
- Firefox, Safari, real mobile devices, screen readers
- Automated colour-contrast audit (palette chosen for high contrast; not measured)
