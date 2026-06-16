import { useState, useCallback } from 'react';

export const useSimulationSpeed = () => {
  const [speed, setSpeed] = useState(1);       
  const [isPaused, setIsPaused] = useState(false);

  const speedUp = useCallback(() => {
    setSpeed(prev => Math.min(prev * 2, 16));  
    setIsPaused(false);
  }, []);

  const slowDown = useCallback(() => {
    setSpeed(prev => Math.max(prev / 2, 0.125)); 
    setIsPaused(false);
  }, []);

  const resetSpeed = useCallback(() => {
    setSpeed(1);
    setIsPaused(false);
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  const setPaused = useCallback((paused: boolean) => {
    setIsPaused(paused);
  }, []);

  return {
    speed,
    isPaused,
    effectiveSpeed: isPaused ? 0 : speed,  
    speedUp,
    slowDown,
    resetSpeed,
    togglePause,
    setPaused, 
  };
};