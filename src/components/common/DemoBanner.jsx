import { IS_LIVE } from '../../config';

export default function DemoBanner() {
  if (IS_LIVE) return null;
  return (
    <div className="border-b border-gold/40 bg-curtain px-4 py-2 text-center text-sm" role="note">
      <strong className="text-gold">Demo mode.</strong> No TMDB credentials found, so you are seeing a small built-in sample (no posters, not live data).
      Configure TMDB credentials (see the README) to load the real catalogue.
    </div>
  );
}
