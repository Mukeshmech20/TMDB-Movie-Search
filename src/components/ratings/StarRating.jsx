import { useState } from 'react';

const STARS = [1, 2, 3, 4, 5];
const STAR_PATH = 'M12 2.5l2.9 6.2 6.8.8-5 4.7 1.3 6.7L12 17.5l-6 3.4 1.3-6.7-5-4.7 6.8-.8z';

const clampHalf = (v) => Math.min(5, Math.max(0.5, Math.round(v * 2) / 2));

/**
 * Five-star rating with half-star steps.
 * Read-only when `onChange` is omitted. With `onChange`, it is a keyboard-accessible slider:
 * arrow keys change the value, Delete/Backspace clears it.
 */
export default function StarRating({ value = 0, onChange, onClear, size = 28, label = 'Rating' }) {
  const [hover, setHover] = useState(0);
  const interactive = Boolean(onChange);
  const shown = hover || value;

  const valueFromPointer = (event, star) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return event.clientX - rect.left < rect.width / 2 ? star - 0.5 : star;
  };

  const onKeyDown = (event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      onChange(clampHalf((value || 0) + 0.5));
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      onChange(clampHalf((value || 1) - 0.5));
    } else if ((event.key === 'Delete' || event.key === 'Backspace') && onClear) {
      event.preventDefault();
      onClear();
    }
  };

  const stars = STARS.map((star) => {
    const fill = Math.min(1, Math.max(0, shown - (star - 1)));
    return (
      <span
        key={star}
        className={`relative inline-block ${interactive ? 'cursor-pointer' : ''}`}
        style={{ width: size, height: size }}
        onMouseMove={interactive ? (e) => setHover(valueFromPointer(e, star)) : undefined}
        onClick={interactive ? (e) => onChange(valueFromPointer(e, star)) : undefined}
      >
        <svg width={size} height={size} viewBox="0 0 24 24" className="absolute inset-0 text-curtain" aria-hidden="true"><path d={STAR_PATH} fill="currentColor" /></svg>
        <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
          <svg width={size} height={size} viewBox="0 0 24 24" className={hover ? 'text-amber-deep' : 'text-amber'} aria-hidden="true"><path d={STAR_PATH} fill="currentColor" /></svg>
        </span>
      </span>
    );
  });

  if (!interactive) {
    return (
      <span className="inline-flex" role="img" aria-label={`${label}: ${value ? `${value} out of 5` : 'not rated'}`}>{stars}</span>
    );
  }

  return (
    <span
      className="inline-flex rounded-poster"
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0.5}
      aria-valuemax={5}
      aria-valuenow={value || 0}
      aria-valuetext={value ? `${value} out of 5 stars` : 'Not rated'}
      onMouseLeave={() => setHover(0)}
      onKeyDown={onKeyDown}
    >
      {stars}
    </span>
  );
}
