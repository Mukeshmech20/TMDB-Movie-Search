-- CINESCAPE community schema. Run in the Supabase SQL editor or with `supabase db push`.
-- Requires Supabase Auth (auth.users, auth.uid()) and Postgres 15+ (security_invoker views).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  display_name text,
  bio text,
  created_at timestamptz not null default now(),
  constraint profiles_username_format check (username ~ '^[A-Za-z0-9_]{3,24}$'),
  constraint profiles_display_name_len check (display_name is null or char_length(display_name) between 1 and 50),
  constraint profiles_bio_len check (bio is null or char_length(bio) <= 280)
);

-- ----------------------------------------------------------------- reviews
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  movie_id integer not null check (movie_id > 0),
  movie_title text not null check (char_length(movie_title) between 1 and 300),
  poster_path text check (poster_path is null or char_length(poster_path) <= 200),
  release_date text check (release_date is null or char_length(release_date) <= 10),
  genre_ids integer[] not null default '{}' check (cardinality(genre_ids) <= 12),
  rating numeric(2, 1) not null,
  body text,
  helpful_count integer not null default 0 check (helpful_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reviews_one_per_user_movie unique (user_id, movie_id),
  constraint reviews_rating_half_steps check (rating between 0.5 and 5 and (rating * 2) = trunc(rating * 2)),
  constraint reviews_body_length check (body is null or char_length(btrim(body)) between 10 and 1000)
);
create index if not exists reviews_movie_idx on public.reviews (movie_id, created_at desc);
create index if not exists reviews_user_idx on public.reviews (user_id, updated_at desc);
create index if not exists reviews_helpful_idx on public.reviews (helpful_count desc, created_at desc) where body is not null;

-- ------------------------------------------------------------ helpful votes
create table if not exists public.review_votes (
  review_id uuid not null references public.reviews (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (review_id, user_id)   -- duplicate-vote protection
);

-- --------------------------------------------------------------- triggers
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  if new.body is not null and btrim(new.body) = '' then new.body := null; end if;
  if new.body is not null then new.body := btrim(new.body); end if;
  return new;
end $$;

drop trigger if exists reviews_touch on public.reviews;
create trigger reviews_touch before insert or update on public.reviews
  for each row execute function public.touch_updated_at();

create or replace function public.sync_helpful_count() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.reviews set helpful_count = helpful_count + 1 where id = new.review_id;
  elsif tg_op = 'DELETE' then
    update public.reviews set helpful_count = greatest(helpful_count - 1, 0) where id = old.review_id;
  end if;
  return null;
end $$;

drop trigger if exists review_votes_count on public.review_votes;
create trigger review_votes_count after insert or delete on public.review_votes
  for each row execute function public.sync_helpful_count();

-- A reviewer cannot vote on their own review.
create or replace function public.block_self_vote() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.reviews r where r.id = new.review_id and r.user_id = new.user_id) then
    raise exception 'You cannot mark your own review as helpful' using errcode = '42501';
  end if;
  return new;
end $$;

drop trigger if exists review_votes_no_self on public.review_votes;
create trigger review_votes_no_self before insert on public.review_votes
  for each row execute function public.block_self_vote();

-- Create a profile automatically when someone signs up.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  wanted text := nullif(btrim(new.raw_user_meta_data ->> 'username'), '');
  final_name text;
begin
  if wanted is null or wanted !~ '^[A-Za-z0-9_]{3,24}$' or exists (select 1 from public.profiles where lower(username) = lower(wanted)) then
    final_name := 'user_' || substr(replace(new.id::text, '-', ''), 1, 10);
  else
    final_name := wanted;
  end if;
  insert into public.profiles (id, username, display_name) values (new.id, final_name, final_name);
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create unique index if not exists profiles_username_lower_idx on public.profiles (lower(username));

-- ------------------------------------------------------------------- views
-- security_invoker: views run with the caller's rights, so RLS on the base tables still applies.
create or replace view public.movie_stats with (security_invoker = true) as
  select movie_id,
         round(avg(rating), 2) as avg_rating,
         count(*)::int as rating_count,
         count(body)::int as review_count
  from public.reviews
  group by movie_id;

create or replace view public.review_feed with (security_invoker = true) as
  select r.id, r.user_id, r.movie_id, r.movie_title, r.poster_path, r.release_date, r.genre_ids,
         r.rating, r.body, r.helpful_count, r.created_at, r.updated_at,
         p.username, p.display_name
  from public.reviews r
  join public.profiles p on p.id = r.user_id;

create or replace view public.top_reviewers with (security_invoker = true) as
  select p.id as user_id, p.username, p.display_name,
         count(r.id)::int as rating_count,
         count(r.body)::int as review_count,
         coalesce(sum(r.helpful_count), 0)::int as helpful_total
  from public.profiles p
  join public.reviews r on r.user_id = p.id
  group by p.id, p.username, p.display_name;

-- --------------------------------------------------- row level security
alter table public.profiles enable row level security;
alter table public.reviews enable row level security;
alter table public.review_votes enable row level security;

drop policy if exists "profiles are public" on public.profiles;
create policy "profiles are public" on public.profiles for select using (true);
drop policy if exists "owners update their profile" on public.profiles;
create policy "owners update their profile" on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "reviews are public" on public.reviews;
create policy "reviews are public" on public.reviews for select using (true);
drop policy if exists "users insert own reviews" on public.reviews;
create policy "users insert own reviews" on public.reviews for insert
  with check (auth.uid() = user_id);
drop policy if exists "owners update reviews" on public.reviews;
create policy "owners update reviews" on public.reviews for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "owners delete reviews" on public.reviews;
create policy "owners delete reviews" on public.reviews for delete
  using (auth.uid() = user_id);

drop policy if exists "users see own votes" on public.review_votes;
create policy "users see own votes" on public.review_votes for select using (auth.uid() = user_id);
drop policy if exists "users vote as themselves" on public.review_votes;
create policy "users vote as themselves" on public.review_votes for insert with check (auth.uid() = user_id);
drop policy if exists "users remove own votes" on public.review_votes;
create policy "users remove own votes" on public.review_votes for delete using (auth.uid() = user_id);

-- Column-level privileges: clients can never write helpful_count, ids or timestamps.
revoke all on public.profiles, public.reviews, public.review_votes from anon, authenticated;
grant select on public.profiles, public.reviews to anon, authenticated;
grant update (username, display_name, bio) on public.profiles to authenticated;
grant insert (user_id, movie_id, movie_title, poster_path, release_date, genre_ids, rating, body) on public.reviews to authenticated;
grant update (rating, body) on public.reviews to authenticated;
grant delete on public.reviews to authenticated;
grant select, insert, delete on public.review_votes to authenticated;
grant select on public.movie_stats, public.review_feed, public.top_reviewers to anon, authenticated;
