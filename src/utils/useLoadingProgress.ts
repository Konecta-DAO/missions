import { useEffect, useState, useRef } from 'react';

// Easing function: easeOutCubic
const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3);
};

interface UseLoadingProgressProps {
  totalTime?: number; // Total loading time in milliseconds (default: 4000ms)
}

const useLoadingProgress = ({ totalTime = 4000 }: UseLoadingProgressProps = {}) => {
  const [loadingPercentage, setLoadingPercentage] = useState<number>(0);
  const [loadingComplete, setLoadingComplete] = useState<boolean>(false);

  // Using refs to persist values across renders without causing re-renders
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const updateProgress = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / totalTime, 1); // Clamp progress to [0,1]
      const easedProgress = easeOutCubic(progress);
      const percentage = Math.floor(easedProgress * 100);

      setLoadingPercentage(percentage);

      if (elapsed < totalTime) {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      } else {
        setLoadingComplete(true);
        setLoadingPercentage(100);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);

    // Cleanup on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [totalTime]);

  return { loadingPercentage, loadingComplete };
};

export default useLoadingProgress;
