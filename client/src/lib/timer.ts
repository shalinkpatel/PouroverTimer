import { useCallback, useEffect, useRef, useState } from "react";

export function useTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const rafRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const pausedTimeRef = useRef<number>(0);

  const start = useCallback(() => {
    if (!isRunning) {
      startTimeRef.current = performance.now() - (pausedTimeRef.current * 1000);
      setIsRunning(true);
    }
  }, [isRunning]);

  const pause = useCallback(() => {
    if (isRunning) {
      setIsRunning(false);
      pausedTimeRef.current = time;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    }
  }, [isRunning, time]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTime(0);
    pausedTimeRef.current = 0;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    let frame = 0;
    const animate = (now: number) => {
      frame++;
      if (frame % 2 === 0) { // Update at 30fps to save resources
        const elapsed = (now - (startTimeRef.current || 0)) / 1000;
        setTime(elapsed);
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isRunning]);

  return { time, isRunning, start, pause, reset };
}
