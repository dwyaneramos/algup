import { useState, useRef } from 'react';
// Generated with Claude Code Sonnet 4.6


export function useTimer() {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const start = () => {
    if (running) return;
    clearInterval(intervalRef.current!);
    resetTime();
    setRunning(true);
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      setTime(Date.now() - startTimeRef.current);
    }, 10);
  };

  const stop = () => {
    if (!running) return;
    clearInterval(intervalRef.current!);
    setRunning(false);
  };

  const formatted = () => {
    const ms = time % 1000;
    const s = Math.floor(time / 1000) % 60;
    const m = Math.floor(time / 60000);
    return `${m > 0 ? `${m}:${String(s).padStart(2, '0')}` : s}.${String(ms).padStart(3, '0').slice(0, 2)}`;
  };

  const resetTime = () => {
    setTime(0);
  };

  return { time, running, start, stop, formatted, resetTime };
}
