import { useEffect } from 'react';

const BASE = 'CINESCAPE';

export default function useDocumentTitle(title, description) {
  useEffect(() => {
    document.title = title ? `${title} | ${BASE}` : `${BASE} - Discover. Explore. Review. Repeat.`;
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, [title, description]);
}
