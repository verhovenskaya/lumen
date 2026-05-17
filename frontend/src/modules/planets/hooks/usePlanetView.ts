import { useState, useCallback } from 'react';
import type { PlanetConfig } from '../../../modules/planets/planets.config';

export type ViewMode = 'gallery' | 'detail';

export const usePlanetView = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetConfig | null>(null);

  const openDetail = useCallback((planet: PlanetConfig) => {
    setSelectedPlanet(planet);
    setViewMode('detail');
  }, []);

  const closeDetail = useCallback(() => {
    setViewMode('gallery');
    setSelectedPlanet(null);
  }, []);

  return {
    viewMode,
    selectedPlanet,
    openDetail,
    closeDetail,
  };
};