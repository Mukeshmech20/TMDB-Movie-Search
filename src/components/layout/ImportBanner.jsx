import { useState } from 'react';
import { useReviews } from '../../context/ReviewsContext';

/** Offered after sign-in when this browser holds ratings that are not in the account yet. Nothing is deleted. */
export default function ImportBanner() {
  const { importable, importLocal, dismissImport } = useReviews();
  const [busy, setBusy] = useState(false);
  if (importable.length === 0) return null;
  const n = importable.length;
  return (
    <div className="border-b border-gold/40 bg-curtain px-4 py-3 text-sm" role="region" aria-label="Import ratings">
      <div className="page flex flex-wrap items-center justify-between gap-3 !px-0">
        <p>You have <strong className="text-gold">{n}</strong> {n === 1 ? 'rating' : 'ratings'} saved on this device that {n === 1 ? 'is' : 'are'} not in your account. Import {n === 1 ? 'it' : 'them'} to share with the community. Your local copy is kept.</p>
        <div className="flex gap-2">
          <button type="button" className="btn-primary !min-h-[38px]" disabled={busy} onClick={async () => { setBusy(true); try { await importLocal(); } finally { setBusy(false); } }}>{busy ? 'Importing...' : 'Import now'}</button>
          <button type="button" className="btn-ghost !min-h-[38px]" disabled={busy} onClick={dismissImport}>Not now</button>
        </div>
      </div>
    </div>
  );
}
