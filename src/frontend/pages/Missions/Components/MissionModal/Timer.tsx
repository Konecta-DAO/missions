import React, { useState, useEffect } from 'react'

interface TimerProps {
    milliseconds: bigint;
}

const Timer : React.FC<TimerProps> = ({ milliseconds }) =>{
  const [timer, setTimer] = useState<bigint>(0n);

  useEffect(() => {
    setTimer(milliseconds / 1000n);
  }, [milliseconds])

  useEffect(() => {
    if (timer > 0) {
      setTimeout(() => {
        setTimer(prev => prev - 1n);
      }, 1000); // Update timer every second
    }
  }, [timer])

  const getFormattedTime = (totalseconds: bigint): string => {
    const seconds = Math.floor(Number(totalseconds % 60n));
    const minutes = Math.floor(Number((totalseconds / (60n)) % 60n));
    const hours = Math.floor(Number((totalseconds / (60n * 60n)) % 60n));

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <p>{getFormattedTime(timer)}</p>
  )
}

export default Timer