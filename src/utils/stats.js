/** Pure statistics over the viewer's own diary and ratings (no network). */
export function computeStats({ diary = {}, reviews = {}, favorites = [] }) {
  const entries = Object.values(reviews);
  const ratings = entries.map((e) => e.rating).filter(Boolean);
  const distribution = Object.fromEntries(Array.from({ length: 10 }, (_, i) => [(i + 1) / 2, 0]));
  ratings.forEach((r) => { distribution[r] = (distribution[r] || 0) + 1; });

  const watchedIds = new Set([...Object.keys(diary), ...Object.keys(reviews)]);
  const genreCount = {};
  const decadeCount = {};
  const seen = new Map();
  [...Object.values(diary).map((d) => d.movie), ...entries.map((e) => e.movie)].forEach((m) => { if (m?.id) seen.set(m.id, m); });
  seen.forEach((m) => {
    (m.genre_ids || []).forEach((g) => { genreCount[g] = (genreCount[g] || 0) + 1; });
    const year = Number(String(m.release_date || '').slice(0, 4));
    if (year) { const d = `${Math.floor(year / 10) * 10}s`; decadeCount[d] = (decadeCount[d] || 0) + 1; }
  });
  const top = (obj, n) => Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n);
  const average = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
  const highest = entries.filter((e) => e.rating === Math.max(...ratings, 0) && e.rating).map((e) => e.movie);

  return {
    watched: watchedIds.size,
    rated: ratings.length,
    reviewed: entries.filter((e) => e.text).length,
    favorites: favorites.length,
    average,
    distribution,
    topGenres: top(genreCount, 5).map(([id, count]) => ({ id: Number(id), count })),
    topDecade: top(decadeCount, 1)[0] ? { decade: top(decadeCount, 1)[0][0], count: top(decadeCount, 1)[0][1] } : null,
    highest: highest.slice(0, 5),
  };
}
