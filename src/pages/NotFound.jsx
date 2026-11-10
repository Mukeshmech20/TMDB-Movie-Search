import { EmptyState } from '../components/common/States';

export default function NotFound() {
  return (
    <div className="page py-12">
      <EmptyState title="This page is not in the lineup" message="The address may be mistyped or the page may have moved." actionLabel="Go to Home" actionTo="/" />
    </div>
  );
}
