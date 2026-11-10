import { Link } from 'react-router-dom';

export function EmptyState({ title, message, actionLabel, actionTo }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-mute">{message}</p>
      {actionTo && <Link to={actionTo} className="btn-primary mt-2">{actionLabel}</Link>}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center" role="alert">
      <h2 className="text-2xl font-bold">Something went wrong</h2>
      <p className="text-mute">{error?.message || 'The request failed.'}</p>
      {onRetry && <button type="button" onClick={onRetry} className="btn-primary mt-2">Try again</button>}
    </div>
  );
}

export function PosterSkeletons({ count = 8 }) {
  return Array.from({ length: count }, (_, i) => (
    <div key={i} className="w-40 shrink-0 sm:w-44" aria-hidden="true">
      <div className="skeleton aspect-[2/3]" />
      <div className="skeleton mt-3 h-4 w-3/4" />
      <div className="skeleton mt-2 h-3 w-1/2" />
    </div>
  ));
}
