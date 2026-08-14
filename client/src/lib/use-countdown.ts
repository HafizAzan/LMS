import { useEffect, useState } from 'react';

export function useCountdown(initialSeconds: number, resetKey = 0) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const stamp = `${initialSeconds}:${resetKey}`;
  const [seen, setSeen] = useState(stamp);

  if (seen !== stamp) {
    setSeen(stamp);
    setSeconds(initialSeconds);
  }

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const id = window.setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(id);
  }, [seconds]);

  return seconds;
}
