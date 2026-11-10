import { IS_LIVE } from '../../config';

export default function DemoBanner() {
  if (IS_LIVE) return null;
  return (
    <div className="border-b border-amber/40 bg-curtain px-4 py-2 text-center text-sm" role="note">
      <strong className="text-amber">Demo mode.</strong> No TMDB credentials found, so you are seeing a small built-in sample (no posters, not live data).
      Add a key to <code className="rounded bg-night px-1">.env</code> to load the real catalogue; see the README.
    </div>
  );
}
