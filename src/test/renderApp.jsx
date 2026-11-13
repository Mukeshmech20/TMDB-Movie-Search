import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { AuthProvider } from '../context/AuthContext';
import { MovieProvider } from '../context/MovieContext';
import { ReviewsProvider } from '../context/ReviewsContext';
import { ToastProvider } from '../context/ToastContext';

export function renderApp(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ToastProvider><AuthProvider><MovieProvider><ReviewsProvider><App /></ReviewsProvider></MovieProvider></AuthProvider></ToastProvider>
    </MemoryRouter>,
  );
}
