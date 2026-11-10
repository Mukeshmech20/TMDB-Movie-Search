import { RATING_OPTIONS, SORT_OPTIONS } from '../../config';

const thisYear = new Date().getFullYear();
const YEARS = Array.from({ length: thisYear + 1 - 1950 + 1 }, (_, i) => thisYear + 1 - i);

function Select({ id, label, value, onChange, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">{label}</label>
      <select id={id} className="field" value={value} onChange={(e) => onChange(e.target.value)}>{children}</select>
    </div>
  );
}

export default function FilterBar({ filters, genres, onChange, onClear }) {
  const genreName = genres.find((g) => String(g.id) === String(filters.genre))?.name;
  const active = [
    filters.genre && { key: 'genre', label: `Genre: ${genreName || filters.genre}` },
    filters.year && { key: 'year', label: `Year: ${filters.year}` },
    filters.rating && { key: 'rating', label: `Rating ${filters.rating}+` },
  ].filter(Boolean);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Select id="f-genre" label="Genre" value={filters.genre} onChange={(v) => onChange({ genre: v })}>
          <option value="">All genres</option>
          {genres.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </Select>
        <Select id="f-year" label="Release year" value={filters.year} onChange={(v) => onChange({ year: v })}>
          <option value="">Any year</option>
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </Select>
        <Select id="f-rating" label="TMDB rating" value={filters.rating} onChange={(v) => onChange({ rating: v })}>
          {RATING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Select>
        <Select id="f-sort" label="Sort by" value={filters.sort} onChange={(v) => onChange({ sort: v })}>
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Select>
      </div>
      {active.length > 0 && (
        <div className="flex flex-wrap items-center gap-2" aria-label="Active filters">
          {active.map((f) => (
            <button key={f.key} type="button" className="chip" onClick={() => onChange({ [f.key]: '' })} aria-label={`Clear filter ${f.label}`}>{f.label} &times;</button>
          ))}
          <button type="button" className="text-sm text-amber underline" onClick={onClear}>Clear all filters</button>
        </div>
      )}
    </div>
  );
}
