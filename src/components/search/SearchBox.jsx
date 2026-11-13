import { SEARCH_MAX, SEARCH_MIN } from '../../config';
import { SearchIcon } from '../common/Icons';

export default function SearchBox({ value, onChange, loading, inputRef }) {
  const trimmed = value.trim();
  const tooShort = trimmed.length > 0 && trimmed.length < SEARCH_MIN;

  return (
    <div>
      <label htmlFor="movie-search" className="mb-1 block text-sm font-medium">Search by title</label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mute"><SearchIcon /></span>
        <input
          ref={inputRef}
          id="movie-search"
          type="search"
          className="field pl-10"
          placeholder="Try Interstellar or Parasite"
          value={value}
          maxLength={SEARCH_MAX}
          onChange={(e) => onChange(e.target.value)}
          aria-describedby="search-hint"
          aria-invalid={tooShort}
        />
        {loading && <span className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-gold border-t-transparent" role="status" aria-label="Searching" />}
      </div>
      <p id="search-hint" className={`mt-1 text-xs ${tooShort ? 'text-crimson' : 'text-mute'}`}>
        {tooShort ? `Type at least ${SEARCH_MIN} characters to search.` : 'Results update as you type.'}
      </p>
    </div>
  );
}
