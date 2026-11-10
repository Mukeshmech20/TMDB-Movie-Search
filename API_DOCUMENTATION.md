# TMDB API usage

Base URL `https://api.themoviedb.org/3`. Images: `https://image.tmdb.org/t/p/{size}{path}` with sizes `w342` (cards), `w500` (details poster), `w1280` (backdrops), `w185` (cast). Missing paths render a fallback instead of a broken image.

## Authentication

`VITE_TMDB_READ_TOKEN` is sent as `Authorization: Bearer <token>`. If only `VITE_TMDB_API_KEY` is set, it is sent as the `api_key` query parameter. All requests include `language=en-US`.

## Endpoints

| Feature | Endpoint | Function |
| --- | --- | --- |
| Trending | `GET /trending/movie/week` | `getTrending` |
| Popular | `GET /movie/popular` | `getPopular` |
| Top rated | `GET /movie/top_rated` | `getTopRated` |
| Now playing | `GET /movie/now_playing` | `getNowPlaying` |
| Upcoming | `GET /movie/upcoming` | `getUpcoming` |
| Search | `GET /search/movie` (`query`, `page`, `primary_release_year`) | `searchMovies` |
| Discover | `GET /discover/movie` (`with_genres`, `primary_release_year`, `vote_average.gte`, `vote_count.gte`, `sort_by`, `page`) | `discoverMovies` |
| Genres | `GET /genre/movie/list` (cached per session) | `getGenres` |
| Details, credits, videos, recommendations, similar | `GET /movie/{id}?append_to_response=credits,videos,recommendations,similar` | `getMovieDetails` |

`vote_count.gte` is added (50 with a rating filter, 200 when sorting by rating) so obscure titles with a handful of votes do not dominate rating results.

## Error handling

`tmdbGet` throws `ApiError` with a readable message for network failure, 401, 404, 429 and other statuses. `429` responses are retried up to twice, honouring `Retry-After` (capped at 5 seconds). `AbortError` is never shown to the user. Pages show an error state with a **Try again** button.

## Demo mode

With no credentials, `movieService` serves `data/fallbackMovies.js` with the same response shape, applying filters, sorting and paging locally.
