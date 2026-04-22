import { useState, useCallback } from 'react';
import { type PlanetConfig } from '../config/planets.config';

export type ViewMode = 'center' | 'shifted';

export const usePlanetInfo = () => {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetConfig | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('center');

  const openInfo = useCallback((planet: PlanetConfig) => {
    setSelectedPlanet(planet);
    setIsInfoOpen(true);
    setViewMode('shifted');  
  }, []);

  const closeInfo = useCallback(() => {
    setIsInfoOpen(false);
    setViewMode('center');  
    setSelectedPlanet(null);
  }, []);

  return {
    selectedPlanet,
    isInfoOpen,
    viewMode,
    openInfo,
    closeInfo,
  };
};