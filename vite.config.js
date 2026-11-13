import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// In development, `/api/tmdb` is proxied to TMDB with the credential from TMDB_READ_TOKEN / TMDB_API_KEY
// (server-side env, read here by Node, never bundled).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const token = env.TMDB_READ_TOKEN;
  const apiKey = env.TMDB_API_KEY;
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/tmdb': {
          target: 'https://api.themoviedb.org',
          changeOrigin: true,
          rewrite: (path) => {
            const url = new URL(path.replace(/^\/api\/tmdb/, '/3'), 'http://x');
            if (!token && apiKey) url.searchParams.set('api_key', apiKey);
            return url.pathname + url.search;
          },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.js'],
      css: false,
      env: { VITE_TMDB_READ_TOKEN: '', VITE_TMDB_API_KEY: '', VITE_TMDB_PROXY: '', VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '' },
      exclude: ['node_modules', 'dist', 'e2e'],
    },
  };
});
