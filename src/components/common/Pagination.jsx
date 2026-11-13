import { ChevronIcon } from './Icons';

const windowOf = (page, total) => {
  const nums = new Set([1, total, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((n) => nums.add(n));
  if (page >= total - 2) [total - 1, total - 2, total - 3].forEach((n) => nums.add(n));
  const sorted = [...nums].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  return sorted.flatMap((n, i) => (i > 0 && n - sorted[i - 1] > 1 ? ['gap-' + n, n] : [n]));
};

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      <button type="button" className="btn-ghost !px-3" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page"><ChevronIcon dir="left" /> <span className="hidden sm:inline">Prev</span></button>
      {windowOf(page, totalPages).map((n) =>
        typeof n === 'string' ? (
          <span key={n} className="px-1 text-mute" aria-hidden="true">…</span>
        ) : (
          <button key={n} type="button" className={`btn !min-w-[44px] !px-3 ${n === page ? 'bg-gold text-night' : 'border border-line text-paper hover:border-gold hover:text-gold'}`} aria-current={n === page ? 'page' : undefined} aria-label={`Page ${n}`} onClick={() => onChange(n)}>{n}</button>
        ),
      )}
      <button type="button" className="btn-ghost !px-3" disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Next page"><span className="hidden sm:inline">Next</span> <ChevronIcon /></button>
    </nav>
  );
}
