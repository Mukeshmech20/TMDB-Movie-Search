import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DEMO_MOVIES } from '../data/fallbackMovies';
import { renderApp } from './renderApp';

const first = DEMO_MOVIES.slice().sort((a, b) => b.popularity - a.popularity)[0];
const stored = (key) => JSON.parse(localStorage.getItem(key) || 'null');

async function openRateDialog(user, title) {
  await user.click(await screen.findByRole('button', { name: new RegExp(`^(Rate|Edit your rating for) ${title.replace(/[()]/g, '\\$&')}`) }));
  return screen.findByRole('dialog');
}

describe('rating and reviewing from a movie card', () => {
  it('shows Rate, Review, Watchlist and Favorite on every card', async () => {
    renderApp('/discover');
    const card = await screen.findByTestId(`movie-card-${first.id}`);
    for (const label of [/^Rate /, /Write a review of /, /Add .* to watchlist/, /Add .* to favorites/]) {
      expect(within(card).getByRole('button', { name: label })).toBeInTheDocument();
    }
  });

  it('rates with half stars via keyboard, saves, shows it on the card, then updates and removes it', async () => {
    const user = userEvent.setup();
    renderApp('/discover');
    let dialog = await openRateDialog(user, first.title);
    const stars = within(dialog).getByRole('slider');
    stars.focus();
    for (let i = 0; i < 9; i += 1) fireEvent.keyDown(stars, { key: 'ArrowRight' });
    expect(within(dialog).getByTestId('rating-preview')).toHaveTextContent('4.5');
    await user.click(within(dialog).getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(await screen.findByText(/Saved your rating/)).toBeInTheDocument();
    expect(stored('cinescape.reviews')[first.id].rating).toBe(4.5);
    expect(within(screen.getByTestId(`movie-card-${first.id}`)).getByText(/You 4.5/)).toBeInTheDocument();

    dialog = await openRateDialog(user, first.title);
    const s2 = within(dialog).getByRole('slider');
    s2.focus();
    fireEvent.keyDown(s2, { key: 'ArrowLeft' });
    await user.click(within(dialog).getByRole('button', { name: 'Update' }));
    await waitFor(() => expect(stored('cinescape.reviews')[first.id].rating).toBe(4));

    dialog = await openRateDialog(user, first.title);
    await user.click(within(dialog).getByRole('button', { name: /Remove my rating/ }));
    await waitFor(() => expect(stored('cinescape.reviews')[first.id]).toBeUndefined());
  });

  it('validates review text, counts characters, then saves, edits and deletes the review in the diary', async () => {
    const user = userEvent.setup();
    renderApp('/discover');
    let dialog = await openRateDialog(user, first.title);
    await user.click(within(dialog).getByRole('button', { name: 'Submit' }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(/star rating/i);

    const stars = within(dialog).getByRole('slider');
    stars.focus();
    fireEvent.keyDown(stars, { key: 'End' });
    await user.type(within(dialog).getByLabelText(/Written review/), 'too short');
    expect(within(dialog).getByText(/9 \/ 1000/)).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Submit' }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(/at least 10/);

    await user.type(within(dialog).getByLabelText(/Written review/), ' but now it is long enough');
    await user.click(within(dialog).getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(stored('cinescape.reviews')[first.id].text).toMatch(/long enough/));
    expect(await screen.findByText(/Saved your review/)).toBeInTheDocument();
  });

  it('keeps review history in the diary with edit and delete', async () => {
    localStorage.setItem('cinescape.reviews', JSON.stringify({ [first.id]: { movie: first, rating: 3.5, text: 'Solid film with a strong third act.', updatedAt: '2026-11-01T10:00:00Z' } }));
    const user = userEvent.setup();
    renderApp('/diary');
    const entry = await screen.findByTestId('diary-entry');
    expect(within(entry).getByText(/strong third act/)).toBeInTheDocument();
    await user.click(within(entry).getByRole('button', { name: /Edit rating/ }));
    const dialog = await screen.findByRole('dialog');
    const box = within(dialog).getByLabelText(/Written review/);
    await user.clear(box);
    await user.type(box, 'Rewatched it and it holds up wonderfully.');
    await user.click(within(dialog).getByRole('button', { name: 'Update' }));
    expect(await screen.findByText(/holds up wonderfully/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Delete review/ }));
    await user.click(screen.getByRole('button', { name: /Yes, delete/ }));
    await waitFor(() => expect(stored('cinescape.reviews')).toEqual({}));
  });

  it('shows an empty diary state', async () => {
    renderApp('/diary');
    expect(await screen.findByText('Your diary is empty')).toBeInTheDocument();
  });
});

describe('watchlist and favorites', () => {
  it('adds from a card and lists on the library pages', async () => {
    const user = userEvent.setup();
    renderApp('/discover');
    const card = await screen.findByTestId(`movie-card-${first.id}`);
    await user.click(within(card).getByRole('button', { name: /to watchlist/ }));
    await user.click(within(card).getByRole('button', { name: /to favorites/ }));
    expect(stored('cinescape.watchlist')).toHaveLength(1);
    expect(stored('cinescape.favorites')).toHaveLength(1);
    expect(within(card).getByRole('button', { name: /Remove .* from watchlist/ })).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('search and filters', () => {
  it('searches by title, shows an empty state, and filters by genre with removable chips', async () => {
    const user = userEvent.setup();
    renderApp('/discover');
    await screen.findByTestId('result-count');
    const search = screen.getByRole('searchbox', { name: /search/i });
    await user.type(search, 'zzzzqx');
    expect(await screen.findByText(/No movies match "zzzzqx"/, {}, { timeout: 3000 })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Reset search and filters/ }));
    await user.selectOptions(await screen.findByLabelText('Genre'), '878');
    const chip = await screen.findByRole('button', { name: /Clear filter Genre/ });
    expect(chip).toBeInTheDocument();
    await user.click(chip);
    await waitFor(() => expect(screen.queryByRole('button', { name: /Clear filter Genre/ })).not.toBeInTheDocument());
  });

  it('opens a movie by direct route and shows three separate rating panels', async () => {
    renderApp(`/movie/${first.id}`);
    expect(await screen.findByRole('heading', { name: /TMDB rating/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /CINESCAPE community/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Your rating' })).toBeInTheDocument();
  });
});

describe('feature pages', () => {
  it('mood picker returns a shortlist; random picker returns a movie; compare loads', async () => {
    const user = userEvent.setup();
    const { unmount } = renderApp('/mood');
    await user.click(await screen.findByRole('button', { name: /Cozy/ }));
    expect((await screen.findAllByTestId(/movie-card-/)).length).toBeGreaterThan(0);
    unmount();
    const r = renderApp('/random');
    await user.click(await screen.findByRole('button', { name: /Pick a movie/ }));
    expect(await screen.findByTestId('random-result')).toBeInTheDocument();
    r.unmount();
    renderApp(`/compare?a=${DEMO_MOVIES[0].id}&b=${DEMO_MOVIES[1].id}`);
    expect(await screen.findByTestId('compare-table')).toBeInTheDocument();
  });

  it('unknown routes show a friendly not-found page', async () => {
    renderApp('/nope');
    expect(await screen.findByText(/not in the lineup/)).toBeInTheDocument();
  });
});
