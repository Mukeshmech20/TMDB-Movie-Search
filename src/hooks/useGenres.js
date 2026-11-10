import { getGenres } from '../services/movieService';
import useAsync from './useAsync';

export default function useGenres() {
  const { data } = useAsync(() => getGenres(), 'genres');
  const genres = data || [];
  const nameOf = (id) => genres.find((g) => g.id === id)?.name;
  return { genres, nameOf };
}
