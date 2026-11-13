import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import StarRating from '../components/ratings/StarRating';
import { validateReview } from '../components/ratings/ReviewDialog';
import { explainPick, pickMovieOfTheDay } from '../utils/movieOfTheDay';
import { computeStats } from '../utils/stats';
import { resolveTarget } from '../../api/tmdb/[...path].js';
import handler from '../../api/tmdb/[...path].js';
import { friendlyError } from '../services/reviewService';

function Harness() {
  const [v, setV] = useState(0);
  return <><StarRating value={v} onChange={setV} onClear={() => setV(0)} label="Your rating" /><output>{v}</output></>;
}

describe('StarRating keyboard support', () => {
  it('moves in half-star steps, jumps with Home/End and clears with Delete', () => {
    render(<Harness />);
    const slider = screen.getByRole('slider', { name: /your rating/i });
    slider.focus();
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(screen.getByText('1.5')).toBeInTheDocument();
    fireEvent.keyDown(slider, { key: 'End' });
    expect(screen.getByText('5')).toBeInTheDocument();
    fireEvent.keyDown(slider, { key: 'Home' });
    expect(screen.getByText('0.5')).toBeInTheDocument();
    fireEvent.keyDown(slider, { key: 'Delete' });
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});

describe('validateReview', () => {
  it('requires a rating, and 10+ characters when text is given', () => {
    expect(validateReview({ rating: 0, text: '' })).toMatch(/star rating/i);
    expect(validateReview({ rating: 3, text: 'short' })).toMatch(/at least 10/);
    expect(validateReview({ rating: 3, text: '' })).toBe('');
    expect(validateReview({ rating: 3, text: 'x'.repeat(1001) })).toMatch(/at most 1000/);
    expect(validateReview({ rating: 4.5, text: 'A genuinely great film.' })).toBe('');
  });
});

describe('movie of the day', () => {
  const pool = Array.from({ length: 40 }, (_, i) => ({ id: i, title: `M${i}`, vote_average: 8, vote_count: 1000 }));
  it('is stable within a day and explains itself', () => {
    const d = new Date('2026-11-14T10:00:00Z');
    const a = pickMovieOfTheDay(pool, d);
    expect(pickMovieOfTheDay(pool, new Date('2026-11-14T23:00:00Z')).movie.id).toBe(a.movie.id);
    expect(explainPick(a)).toMatch(/top-rated/);
  });
  it('changes across days', () => {
    const ids = new Set(Array.from({ length: 10 }, (_, i) => pickMovieOfTheDay(pool, new Date(Date.UTC(2026, 10, 1 + i))).movie.id));
    expect(ids.size).toBeGreaterThan(3);
  });
});

describe('personal statistics', () => {
  it('computes counts, average, distribution and genres', () => {
    const m = (id, g, date) => ({ id, title: `T${id}`, genre_ids: g, release_date: date });
    const reviews = { 1: { movie: m(1, [18, 35], '1999-01-01'), rating: 4, text: 'x' }, 2: { movie: m(2, [18], '1995-05-05'), rating: 5, text: '' } };
    const diary = { 3: { movie: m(3, [27], '2010-01-01'), watchedOn: '2026-01-01' } };
    const s = computeStats({ diary, reviews, favorites: [{ id: 1 }] });
    expect(s).toMatchObject({ watched: 3, rated: 2, reviewed: 1, favorites: 1, average: 4.5 });
    expect(s.distribution[4]).toBe(1);
    expect(s.topGenres[0]).toEqual({ id: 18, count: 2 });
    expect(s.topDecade.decade).toBe('1990s');
  });
});

describe('error messages', () => {
  it('maps database errors to readable text', () => {
    expect(friendlyError({ code: '23514', message: 'violates check constraint reviews_body_length (body)' })).toMatch(/10 and 1000/);
    expect(friendlyError({ code: '23505', message: 'profiles_username_key username' })).toMatch(/taken/);
  });
});

describe('TMDB proxy', () => {
  it('allow-lists read-only endpoints and strips client api keys', () => {
    expect(resolveTarget('/api/tmdb/movie/603?append_to_response=videos&api_key=leak').search.has('api_key')).toBe(false);
    expect(resolveTarget('/api/tmdb/account/1/lists')).toBeNull();
    expect(resolveTarget('/api/tmdb/movie/603/../../account')).toBeNull();
  });
  it('adds the server credential and refuses non-GET', async () => {
    const calls = [];
    globalThis.fetch = async (url, init) => { calls.push({ url, init }); return { ok: true, status: 200, text: async () => '{"ok":true}' }; };
    process.env.TMDB_READ_TOKEN = 'server-secret';
    const res = () => { const r = { headers: {} }; r.setHeader = (k, v) => { r.headers[k] = v; }; r.status = (c) => { r.code = c; return r; }; r.json = (b) => { r.body = b; return r; }; r.send = (b) => { r.body = b; return r; }; return r; };
    const ok = res();
    await handler({ method: 'GET', url: '/api/tmdb/trending/movie/week?page=1' }, ok);
    expect(ok.code).toBe(200);
    expect(calls[0].url).toBe('https://api.themoviedb.org/3/trending/movie/week?page=1');
    expect(calls[0].init.headers.Authorization).toBe('Bearer server-secret');
    const bad = res();
    await handler({ method: 'POST', url: '/api/tmdb/trending/movie/week' }, bad);
    expect(bad.code).toBe(405);
    delete process.env.TMDB_READ_TOKEN;
  });
});
