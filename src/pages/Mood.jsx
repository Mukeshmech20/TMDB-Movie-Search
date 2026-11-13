import { useState } from 'react';
import { ErrorState } from '../components/common/States';
import MovieGrid from '../components/movies/MovieGrid';
import useAsync from '../hooks/useAsync';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { discoverMovies } from '../services/movieService';
import { MOODS } from '../utils/moods';

const shuffle = (list) => list.map((m) => [Math.random(), m]).sort((a, b) => a[0] - b[0]).map(([, m]) => m);

export default function Mood() {
  useDocumentTitle('Mood picker', 'Pick how you feel and get a shortlist of movies to match.');
  const [moodId, setMoodId] = useState(null);
  const [short, setShort] = useState(false);
  const [seed, setSeed] = useState(0);
  const mood = MOODS.find((m) => m.id === moodId);

  const { data, error, loading, retry } = useAsync(async (signal) => {
    if (!mood) return null;
    const page = 1 + (seed % 4);
    const query = { genre: mood.genres, rating: '6.5', sort: 'popularity.desc', maxRuntime: short ? 100 : undefined };
    let res = await discoverMovies({ ...query, page }, { signal });
    if (page > 1 && !(res.results || []).length) res = await discoverMovies({ ...query, page: 1 }, { signal }); // small catalogues have fewer pages
    return shuffle((res.results || []).filter((m) => m.title)).slice(0, 12);
  }, `${moodId}:${short}:${seed}`);

  return (
    <div className="page py-8">
      <p className="eyebrow">Mood-based discovery</p>
      <h1 className="mt-1 text-4xl font-bold sm:text-5xl">How are you feeling tonight?</h1>
      <p className="mt-2 max-w-2xl text-mute">Pick a mood. We map it to genres, keep only well-rated films (TMDB 6.5+) and shuffle a fresh shortlist.</p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" role="group" aria-label="Moods">
        {MOODS.map((m) => (
          <button key={m.id} type="button" aria-pressed={moodId === m.id} onClick={() => { setMoodId(m.id); setSeed((s) => s + 1); }} className="stub flex min-h-[88px] flex-col items-start gap-1 text-left transition-colors hover:border-gold aria-pressed:border-gold aria-pressed:bg-curtain">
            <span className="text-2xl" aria-hidden="true">{m.emoji}</span><span className="font-semibold">{m.label}</span>
          </button>
        ))}
      </div>
      {mood && (
        <section className="mt-8" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-2xl font-bold">{mood.label}</h2><p className="text-sm text-mute">{mood.blurb}</p></div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex min-h-[44px] items-center gap-2 text-sm"><input type="checkbox" checked={short} onChange={(e) => setShort(e.target.checked)} className="h-4 w-4 accent-[#E8B84B]" /> Under 100 minutes</label>
              <button type="button" className="btn-primary" onClick={() => setSeed((s) => s + 1)}>Shuffle picks</button>
            </div>
          </div>
          <div className="mt-6">
            {error ? <ErrorState error={error} onRetry={retry} /> : loading || !data ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6" role="status" aria-label="Loading picks">{Array.from({ length: 6 }, (_, i) => <div key={i} className="skeleton aspect-[2/3]" />)}</div>
            ) : data.length === 0 ? <p className="stub text-center text-mute">No matches for this mood{short ? ' under 100 minutes' : ''}. Try another mood or turn off the runtime limit.</p> : <MovieGrid movies={data} />}
          </div>
        </section>
      )}
    </div>
  );
}
