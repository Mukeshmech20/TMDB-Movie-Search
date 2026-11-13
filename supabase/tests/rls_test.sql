-- Behavioural test for the CINESCAPE schema + RLS. Run against a scratch database that has the
-- migration applied (see supabase/README.md). Each check raises an exception on failure.
\set ON_ERROR_STOP on
begin;
insert into auth.users (id, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', '{"username":"alice"}'),
  ('22222222-2222-2222-2222-222222222222', '{"username":"Alice"}'),   -- duplicate (case-insensitive) -> fallback name
  ('33333333-3333-3333-3333-333333333333', '{"username":"x"}');       -- invalid -> fallback name

do $$ begin
  assert (select username from profiles where id = '11111111-1111-1111-1111-111111111111') = 'alice', 'profile created from metadata';
  assert (select username from profiles where id = '22222222-2222-2222-2222-222222222222') like 'user\_%', 'duplicate username falls back';
  assert (select username from profiles where id = '33333333-3333-3333-3333-333333333333') like 'user\_%', 'invalid username falls back';
end $$;

-- ---- as alice (authenticated)
set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);

insert into reviews (user_id, movie_id, movie_title, rating, body) values
  ('11111111-1111-1111-1111-111111111111', 603, 'The Matrix', 4.5, 'A landmark of the genre, still thrilling.');

do $$
declare ok boolean;
begin
  -- invalid rating (not a half step) rejected
  begin insert into reviews (user_id, movie_id, movie_title, rating) values ('11111111-1111-1111-1111-111111111111', 1, 'T', 3.3); ok := false;
  exception when check_violation then ok := true; end; assert ok, 'rating must be half steps';
  -- rating out of range
  begin insert into reviews (user_id, movie_id, movie_title, rating) values ('11111111-1111-1111-1111-111111111111', 1, 'T', 5.5); ok := false;
  exception when check_violation or numeric_value_out_of_range then ok := true; end; assert ok, 'rating <= 5';
  -- too-short body
  begin insert into reviews (user_id, movie_id, movie_title, rating, body) values ('11111111-1111-1111-1111-111111111111', 2, 'T', 3, 'short'); ok := false;
  exception when check_violation then ok := true; end; assert ok, 'body min length';
  -- one review per user per movie
  begin insert into reviews (user_id, movie_id, movie_title, rating) values ('11111111-1111-1111-1111-111111111111', 603, 'The Matrix', 2); ok := false;
  exception when unique_violation then ok := true; end; assert ok, 'unique per user+movie';
  -- cannot insert as someone else
  begin insert into reviews (user_id, movie_id, movie_title, rating) values ('22222222-2222-2222-2222-222222222222', 9, 'T', 2); ok := false;
  exception when insufficient_privilege then ok := true; end; assert ok, 'cannot impersonate';
  -- cannot write helpful_count directly
  begin update reviews set helpful_count = 99 where movie_id = 603; ok := false;
  exception when insufficient_privilege then ok := true; end; assert ok, 'helpful_count is not client-writable';
  -- cannot vote on own review
  begin insert into review_votes (review_id, user_id) select id, user_id from reviews where movie_id = 603; ok := false;
  exception when insufficient_privilege then ok := true; end; assert ok, 'no self votes';
end $$;

-- alice can edit her own review
update reviews set rating = 5, body = 'Even better on a rewatch, honestly.' where movie_id = 603;
do $$ begin assert (select rating from reviews where movie_id = 603) = 5, 'owner can update'; end $$;

-- ---- as bob (user 2)
select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);
do $$
declare n int; ok boolean; rid uuid;
begin
  assert (select count(*) from reviews) = 1, 'reviews are publicly readable';
  update reviews set rating = 1 where movie_id = 603; get diagnostics n = row_count; assert n = 0, 'bob cannot edit alice review';
  delete from reviews where movie_id = 603; get diagnostics n = row_count; assert n = 0, 'bob cannot delete alice review';
  select id into rid from reviews where movie_id = 603;
  insert into review_votes (review_id, user_id) values (rid, '22222222-2222-2222-2222-222222222222');
  begin insert into review_votes (review_id, user_id) values (rid, '22222222-2222-2222-2222-222222222222'); ok := false;
  exception when unique_violation then ok := true; end; assert ok, 'duplicate vote blocked';
  assert (select helpful_count from reviews where id = rid) = 1, 'helpful_count maintained by trigger';
  assert (select count(*) from review_votes) = 1, 'bob sees only his own votes';
  assert (select avg_rating from movie_stats where movie_id = 603) = 5, 'community average view';
  assert (select helpful_total from top_reviewers where username = 'alice') = 1, 'top reviewers view';
  delete from review_votes where user_id = '22222222-2222-2222-2222-222222222222';
  assert (select helpful_count from reviews where id = rid) = 0, 'unvote decrements';
end $$;

-- ---- anonymous visitors can read but not write
reset role; set local role anon;
select set_config('request.jwt.claim.sub', '', true);
do $$
declare ok boolean;
begin
  assert (select count(*) from review_feed) = 1, 'anon can read the public feed';
  begin insert into reviews (user_id, movie_id, movie_title, rating) values ('11111111-1111-1111-1111-111111111111', 5, 'T', 2); ok := false;
  exception when insufficient_privilege then ok := true; end; assert ok, 'anon cannot write';
end $$;

-- ---- alice deletes her review
reset role; set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
delete from reviews where movie_id = 603;
do $$ begin assert (select count(*) from reviews) = 0, 'owner can delete'; end $$;
rollback;
\echo ALL RLS CHECKS PASSED
