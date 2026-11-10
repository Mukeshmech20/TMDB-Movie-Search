import { useEffect, useState } from 'react';
import { readStorage, writeStorage } from '../services/storageService';

export default function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => readStorage(key, initial));

  useEffect(() => {
    writeStorage(key, value);
  }, [key, value]);

  return [value, setValue];
}
