import { useEffect, useState } from 'react';

const useLoadingProgress = (intervalTime = 40, maxPercentage = 100) => {
  const [loadingPercentage, setLoadingPercentage] = useState<number>(0);
  const [loadingComplete, setLoadingComplete] = useState<boolean>(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let percentage = 0;

    interval = setInterval(() => {
      percentage += 1;
      setLoadingPercentage(percentage);

      if (percentage >= maxPercentage) {
        clearInterval(interval);
        setLoadingComplete(true); // Indicate that loading is complete
      }
    }, intervalTime); // Interval time between percentage updates (default: 40ms)

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [intervalTime, maxPercentage]);

  return { loadingPercentage, loadingComplete };
};

export default useLoadingProgress;