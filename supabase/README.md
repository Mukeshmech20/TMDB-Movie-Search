# Supabase setup

1. Create a project at supabase.com.
2. SQL Editor → paste and run `migrations/001_cinescape_schema.sql` (or `supabase db push` with the CLI). It is idempotent.
3. Project Settings → API: copy the **Project URL** and the **anon public** key into `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`. Do not use the service-role key.
4. Authentication → URL Configuration: set the Site URL to your Vercel domain. Email confirmation is on by default; the sign-up form handles both settings.

## What the schema enforces

- `profiles` (auto-created on sign-up, username 3–24 letters/numbers/underscore, unique case-insensitively)
- `reviews`: one per user per movie; rating 0.5–5 in half steps; optional body 10–1000 characters
- `review_votes`: one vote per user per review; `helpful_count` is maintained by a trigger and cannot be written by clients; self-votes are rejected
- RLS: everyone can read; only owners insert, update and delete; column-level grants block writes to ids, timestamps and counters
- Views `movie_stats`, `review_feed`, `top_reviewers` use `security_invoker`, so RLS still applies

## Testing the database

`tests/rls_test.sql` was run against PostgreSQL 16 with `tests/auth_stub.sql`, a minimal stand-in for Supabase's `auth` schema and roles:

```bash
createdb cs_test
psql cs_test -f tests/auth_stub.sql -f migrations/001_cinescape_schema.sql
psql cs_test -f tests/rls_test.sql    # prints ALL RLS CHECKS PASSED
```

Run the same test file against a scratch Supabase database before relying on it in production.
