import { useState, useCallback } from 'react';
import { PLANETS, type PlanetConfig } from '../planets.config';

export const usePlanets = () => {
  console.log('PLANETS in hook:', PLANETS);
  const [activePlanet, setActivePlanet] = useState<PlanetConfig>(PLANETS[3]); 
  const planets = PLANETS;
console.log('planets in hook:', planets);
  const setPlanetById = useCallback((id: string) => {
    const planet = planets.find(p => p.id === id);
    if (planet) setActivePlanet(planet);
  }, [planets]);

  const nextPlanet = useCallback(() => {
    const currentIndex = planets.findIndex(p => p.id === activePlanet.id);
    const nextIndex = (currentIndex + 1) % planets.length;
    setActivePlanet(planets[nextIndex]);
  }, [activePlanet, planets]);

  const prevPlanet = useCallback(() => {
    const currentIndex = planets.findIndex(p => p.id === activePlanet.id);
    const prevIndex = (currentIndex - 1 + planets.length) % planets.length;
    setActivePlanet(planets[prevIndex]);
  }, [activePlanet, planets]);

  return {
    planets,
    activePlanet,
    setPlanetById,
    nextPlanet,
    prevPlanet,
  };
};