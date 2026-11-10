# CINESCAPE

**Discover. Explore. Review. Repeat.**

CINESCAPE is a cinematic movie discovery and review app built with React, Vite and Tailwind CSS, powered by the [TMDB API v3](https://developer.themoviedb.org/docs/getting-started).

## Objectives

- Browse trending, popular, top-rated, now-playing and upcoming movies.
- Search and filter the catalogue (genre, year, rating, sort) with all filters working together.
- Show a rich details page with cast, director, trailers, recommendations and similar movies.
- Let visitors rate movies (half-star steps), write reviews, and keep a watchlist and favorites.

## Features

- Home: featured hero, Trending, Popular, Top rated, Recently viewed, Now playing, Coming soon, genre chips, two curated collections.
- Discover: debounced title search with validation, genre / year / rating filters, three sort orders, removable filter chips, Load more, filters stored in the URL (survive refresh and back navigation).
- Movie details: backdrop, poster, tagline, overview, runtime, genres, language, release date, TMDB rating and vote count, cast, director, production companies, budget, revenue, trailer/video modal, recommended and similar carousels.
- Ratings: five-star component with hover preview, half stars, click or arrow-key rating, edit, remove, optional written review with validation, edit and delete.
- Watchlist and Favorites with empty states, no duplicates, instant updates.
- Toasts, skeleton loaders, image fallbacks, accessible dialog (focus trap, Escape), back-to-top, skip link, responsive mobile navigation.
- Demo mode when no TMDB credentials are configured (clearly labelled with a banner).

## Technology stack

React 19, React Router, Vite, Tailwind CSS 3, TMDB API v3, ESLint. No other runtime dependencies.

## Folder structure

See [PROJECT_ARCHITECTURE.md](PROJECT_ARCHITECTURE.md).

## Setup

```bash
npm install
cp .env.example .env     # then add your TMDB credential
npm run dev              # http://localhost:5173
```

### TMDB registration and configuration

1. Create a free account at https://www.themoviedb.org/signup.
2. Open Settings > API (https://www.themoviedb.org/settings/api) and request a developer key.
3. Copy the **API Read Access Token** into `VITE_TMDB_READ_TOKEN` (preferred), or the **API Key** into `VITE_TMDB_API_KEY`, in `.env`.
4. Restart `npm run dev` after editing `.env`.

Important: Vite embeds `VITE_` variables in the browser bundle, so anyone who opens the deployed site can read the token. TMDB read tokens are intended for this use, but never use an account-level secret. `.env` is git-ignored; only `.env.example` is committed.

Without credentials the app runs in **demo mode**: a 16-film built-in sample with no posters, placeholder vote counts and no cast, trailers or credits. A banner is shown on every page.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint, zero warnings allowed |

## Deployment

### GitHub

```bash
git init
git add .
git commit -m "Initial commit: CINESCAPE"
git branch -M main
git remote add origin https://github.com/<you>/cinescape.git
git push -u origin main
```

### Netlify

1. Netlify > Add new site > Import from Git, choose the repository.
2. Build command `npm run build`, publish directory `dist` (already set in `netlify.toml`).
3. Site configuration > Environment variables: add `VITE_TMDB_READ_TOKEN` (or `VITE_TMDB_API_KEY`).
4. Deploy. The SPA fallback (`/* -> /index.html`) is configured in `netlify.toml` and `public/_redirects`, so direct URLs and refresh work.

Env vars are read at build time, so trigger a new deploy after changing them.

## Rating system

- **TMDB community rating**: score out of 10 from TMDB users, shown with TMDB's vote count. Always labelled as TMDB.
- **Your rating**: the stars you give (0.5 to 5), shown only to you.
- Written reviews are optional (10 to 1000 characters) and can be edited or deleted.
- The app has no backend, so there are no shared ratings and no app-wide average. TMDB scores are never presented as app-user ratings.

## Data persistence

Watchlist, favorites, ratings, reviews and recently viewed movies are stored in `localStorage` under keys prefixed `cinescape.`. They are specific to one browser on one device and are lost if site data is cleared.

## Known limitations

- Search: TMDB's search endpoint cannot filter by genre, rating or sort. While a search is active, those controls are applied to each loaded page of title matches, not to the whole catalogue. The year filter is sent to TMDB.
- Demo mode has no images, cast or trailers.
- Reviews are device-local and not shared.
- Google Fonts (Fraunces, Instrument Sans) load from the network; system serif and sans-serif fonts are used as fallback.
- Tested in headless Chromium only (see [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)).
