import { useState, useCallback } from 'react';

export type AppMode = 'explore' | 'simulation';

export const useSimulation = () => {
  const [mode, setMode] = useState<AppMode>('explore');

  const toggleMode = useCallback(() => {
    setMode(prev => prev === 'explore' ? 'simulation' : 'explore');
  }, []);

  const setExploreMode = useCallback(() => setMode('explore'), []);
  const setSimulationMode = useCallback(() => setMode('simulation'), []);

  return {
    mode,
    isExplore: mode === 'explore',
    isSimulation: mode === 'simulation',
    toggleMode,
    setExploreMode,
    setSimulationMode,
  };
};