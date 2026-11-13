import { LANGUAGE_OPTIONS, RATING_OPTIONS, SORT_OPTIONS } from '../../config';

const thisYear = new Date().getFullYear();
const YEARS = Array.from({ length: thisYear + 1 - 1920 + 1 }, (_, i) => thisYear + 1 - i);

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
  const langName = LANGUAGE_OPTIONS.find((l) => l.value === filters.language)?.label;
  const ratingName = RATING_OPTIONS.find((r) => r.value === filters.rating)?.label;
  const sortName = SORT_OPTIONS.find((s) => s.value === filters.sort)?.label;
  const active = [
    filters.genre && { key: 'genre', label: `Genre: ${genreName || filters.genre}` },
    filters.year && { key: 'year', label: `Year: ${filters.year}` },
    filters.language && { key: 'language', label: `Language: ${langName || filters.language}` },
    filters.rating && { key: 'rating', label: `Rating: ${ratingName || `${filters.rating}+`}` },
    filters.sort && filters.sort !== 'popularity.desc' && { key: 'sort', label: `Sort: ${sortName || filters.sort}`, reset: 'popularity.desc' },
  ].filter(Boolean);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <Select id="f-genre" label="Genre" value={filters.genre} onChange={(v) => onChange({ genre: v })}>
          <option value="">All genres</option>
          {genres.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </Select>
        <Select id="f-year" label="Release year" value={filters.year} onChange={(v) => onChange({ year: v })}>
          <option value="">Any year</option>
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </Select>
        <Select id="f-language" label="Language" value={filters.language} onChange={(v) => onChange({ language: v })}>
          {LANGUAGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Select>
        <Select id="f-rating" label="TMDB rating" value={filters.rating} onChange={(v) => onChange({ rating: v })}>
          {RATING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Select>
        <Select id="f-sort" label="Sort by" value={filters.sort} onChange={(v) => onChange({ sort: v })}>
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Select>
      </div>
      {active.length > 0 && (
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Active filters">
          {active.map((f) => (
            <button key={f.key} type="button" className="chip" onClick={() => onChange({ [f.key]: f.reset || '' })} aria-label={`Clear filter ${f.label}`}>{f.label} &times;</button>
          ))}
          <button type="button" className="text-sm text-gold underline" onClick={onClear}>Clear all filters</button>
        </div>
      )}
    </div>
  );
}
