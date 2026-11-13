import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { MovieProvider } from './context/MovieContext';
import { ReviewsProvider } from './context/ReviewsContext';
import { ToastProvider } from './context/ToastContext';
import './styles/index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <MovieProvider>
            <ReviewsProvider>
              <App />
            </ReviewsProvider>
          </MovieProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
);
