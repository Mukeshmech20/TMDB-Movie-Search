# Architecture

```
src/
  config/        Constants: TMDB URLs, image sizes, auth (from env), storage keys, filter options
  services/
    tmdbApi.js       Single HTTP entry point: auth, query building, abort, 429 retry, typed errors
    movieService.js  Endpoint functions; switches to demo data when no credentials exist
    storageService.js Safe localStorage read/write
  data/          fallbackMovies.js: demo catalogue and genres (demo mode only)
  context/
    MovieContext.jsx  Watchlist, favorites, ratings/reviews, recently viewed (persisted)
    ToastContext.jsx  Toast notifications
  hooks/
    useAsync.js       Cancellable data loading with derived loading state
    useDiscover.js    Paged discover/search with Load more and race protection
    useDebounce.js, useLocalStorage.js, useGenres.js
  components/
    common/    Poster (with fallbacks), Modal, States (empty/error/skeleton), DemoBanner, BackToTop, Icons
    layout/    Layout, Navbar, Footer
    movies/    MovieCard, MovieRow/Carousel, MovieGrid, Hero, TrailerModal
    search/    SearchBox
    filters/   FilterBar
    ratings/   StarRating, ReviewPanel
  pages/       Home, Discover, MovieDetails, Watchlist, Favorites, LibraryPage (shared), NotFound
  styles/      index.css: Tailwind layers and design-system component classes
  utils/       format.js, images.js
```

## Key decisions

- **One request layer.** Components never call `fetch`; they use `movieService`, which uses `tmdbApi`.
- **Demo mode is explicit.** `IS_LIVE` in `config` decides the data source; `DemoBanner` is always shown when it is false.
- **Filters live in the URL** (`/discover?q=&genre=&year=&rating=&sort=`), giving refresh, back-button and shareable-link behaviour without extra state.
- **Race safety.** `useAsync` and `useDiscover` abort the previous request on every change and on unmount.
- **One call for details.** `append_to_response=credits,videos,recommendations,similar` replaces four requests.
- **Stored movies are snapshots** (id, title, date, poster, rating, genres, overview), so list pages render without network calls.

## Design system

Tokens are in `tailwind.config.js`: night / velvet / curtain surfaces, paper text, projector-amber accent, crimson for favorites; Fraunces for display, Instrument Sans for UI; `rounded-poster` (10px) for media and fields, pill radius for buttons and chips. Component classes (`btn-*`, `field`, `badge`, `chip`, `skeleton`, `toast`, `modal-panel`, `stub`) are defined once in `styles/index.css`. The details-page rating panels use a ticket-stub style (dashed divider).
