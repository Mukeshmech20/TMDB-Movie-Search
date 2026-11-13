# CINESCAPE — Discover. Explore. Review. Repeat.

A movie discovery and community review app built with React 19, Vite, Tailwind CSS, TMDB and (optionally) Supabase.

## What you can do

- **Rate and review from any movie card**: every card has labelled *Rate*, *Review*, *Watchlist* and *Favorite* buttons. Half-star ratings, keyboard support (arrow keys, Home/End, Delete), validation (10–1000 characters), character counter, edit, delete and a review history in the Diary.
- **Three scores, never mixed**: *TMDB* (out of 10), *CINESCAPE community* (out of 5, from the database) and *Your rating* (out of 5).
- **Community (needs Supabase)**: accounts, profiles, public reviews, helpful votes (one per person, not on your own review), top reviewers, trending and latest reviews.
- **Discover**: title search, genre / year / language / TMDB rating filters, sorting, real pagination, filter chips, shareable URLs.
- **Also**: movie of the day (with the reason it was picked), mood picker, random picker, side-by-side comparison, personal diary, personal statistics, watchlist, favorites.

Without Supabase the app is fully usable: ratings and reviews are saved in the browser, and community sections explain that they are switched off. Without TMDB credentials it shows a small clearly-labelled demo catalogue.

## Run locally

```bash
npm install
cp .env.example .env     # then fill in values
npm run dev
npm run lint && npm test && npm run build
```

## Configuration

| Variable | Where | Purpose |
|---|---|---|
| `TMDB_READ_TOKEN` (or `TMDB_API_KEY`) | server only (Vercel env / local `.env`) | TMDB credential used by the `/api/tmdb` proxy |
| `VITE_TMDB_PROXY=true` | build-time | Makes the browser call `/api/tmdb` instead of TMDB directly |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | build-time | Enables accounts and community reviews. **Anon key only. Never put the `service_role` key in this project.** |
| `VITE_TMDB_READ_TOKEN` / `VITE_TMDB_API_KEY` | build-time | Legacy direct mode. **These are compiled into the public JavaScript and can be read by anyone.** |

### Why the TMDB proxy

Anything prefixed `VITE_` ends up in the downloadable bundle. The previous version shipped the TMDB token that way. `api/tmdb/[...path].js` is a Vercel serverless function that holds the token server-side, only forwards read-only TMDB endpoints, and caches responses for 5 minutes. **If your old token was ever deployed, rotate it in your TMDB account settings.**

## Deploy on Vercel

1. Import the repository in Vercel (framework preset: Vite; `vercel.json` is included and handles SPA routing, security headers and the CSP).
2. Add environment variables: `TMDB_READ_TOKEN`, `VITE_TMDB_PROXY=true`, and (optional) the two Supabase variables.
3. Deploy. Remove any old `VITE_TMDB_READ_TOKEN` variable from Vercel and rotate the token.

## Supabase setup

See [`supabase/README.md`](supabase/README.md): create a project, run `supabase/migrations/001_cinescape_schema.sql`, add the URL and anon key to Vercel, and (optionally) adjust email confirmation in Auth settings.

## Data and privacy notes

- Signed-in ratings and reviews are public and stored in Supabase with Row Level Security.
- Watchlist, favorites, recently viewed and diary watch-dates are stored in this browser (localStorage).
- Ratings made before signing in stay on the device. After signing in, a banner offers to import them into the account; nothing is deleted.

## Tests

- `npm test` — Vitest: star-rating keyboard behaviour, review validation, movie of the day, statistics, TMDB proxy security, and user journeys (rate from a card, review validation, edit/delete, diary, watchlist/favorites, search, filters, direct routes, mood/random/compare).
- `supabase/tests/rls_test.sql` — database behaviour and RLS checks (see `supabase/README.md`).

## Credits

Movie data and images by [TMDB](https://www.themoviedb.org). This product uses the TMDB API but is not endorsed or certified by TMDB.
