// Vercel serverless proxy for TMDB. Keeps the TMDB credential on the server (TMDB_READ_TOKEN or
// TMDB_API_KEY, never prefixed with VITE_) and only forwards a small allow-list of read-only endpoints.
const ALLOWED = [
  /^\/trending\/movie\/(day|week)$/,
  /^\/movie\/(popular|top_rated|now_playing|upcoming)$/,
  /^\/movie\/\d+$/,
  /^\/search\/movie$/,
  /^\/discover\/movie$/,
  /^\/genre\/movie\/list$/,
];

export function resolveTarget(rawUrl) {
  const url = new URL(rawUrl, 'http://localhost');
  const path = url.pathname.replace(/^\/api\/tmdb/, '') || '/';
  if (!ALLOWED.some((re) => re.test(path))) return null;
  url.searchParams.delete('api_key');
  return { path, search: url.searchParams };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const token = process.env.TMDB_READ_TOKEN;
  const apiKey = process.env.TMDB_API_KEY;
  if (!token && !apiKey) return res.status(500).json({ error: 'TMDB credentials are not configured on the server.' });

  const target = resolveTarget(req.url);
  if (!target) return res.status(404).json({ error: 'Endpoint not allowed' });
  if (!token) target.search.set('api_key', apiKey);

  try {
    const upstream = await fetch(`https://api.themoviedb.org/3${target.path}?${target.search}`, {
      headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    const body = await upstream.text();
    res.setHeader('Content-Type', 'application/json');
    if (upstream.ok) res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res.status(upstream.status).send(body);
  } catch {
    return res.status(502).json({ error: 'Could not reach TMDB.' });
  }
}
