import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ expiresAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!expiresAt) return;

    const expiryTime = new Date(expiresAt).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const difference = expiryTime - now;

      if (difference <= 0) {
        setTimeLeft('00:00');
        if (onExpire) onExpire();
        return false; // Stop timer
      }

      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
      return true; // Continue timer
    };

    // Run immediately so we don't wait 1s for first render
    const shouldContinue = updateTimer();

    if (shouldContinue) {
      const intervalId = setInterval(updateTimer, 1000);
      return () => clearInterval(intervalId);
    }
  }, [expiresAt, onExpire]);

  return <span className="countdown-timer">{timeLeft}</span>;
};

export default CountdownTimer;
