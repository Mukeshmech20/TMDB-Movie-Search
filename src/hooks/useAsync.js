import { useEffect, useRef, useState } from 'react';

/**
 * Runs `task(signal)` whenever `key` changes (or retry is called), aborting the previous request.
 * `loading` is derived: a result only counts if it belongs to the current key and attempt.
 */
export default function useAsync(task, key) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({ token: null, data: null, error: null });
  const taskRef = useRef(task);
  const token = `${key}:${attempt}`;

  useEffect(() => {
    taskRef.current = task;
  });

  useEffect(() => {
    const controller = new AbortController();
    taskRef.current(controller.signal)
      .then((data) => setResult({ token, data, error: null }))
      .catch((error) => {
        if (error.name !== 'AbortError') setResult({ token, data: null, error });
      });
    return () => controller.abort();
  }, [token]);

  const current = result.token === token;
  return {
    data: current ? result.data : null,
    error: current ? result.error : null,
    loading: !current,
    retry: () => setAttempt((n) => n + 1),
  };
}
