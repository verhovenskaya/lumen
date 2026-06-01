import React from 'react';
import type { PlanetId } from '../types';
import { PLANETS_DATA } from '../config';
import styles from '../PlanetaryWeatherCenter.module.scss';

interface PlanetSelectorProps {
  selectedPlanet: PlanetId;
  onSelectPlanet: (planetId: PlanetId) => void;
}

export const PlanetSelector: React.FC<PlanetSelectorProps> = ({
  selectedPlanet,
  onSelectPlanet,
}) => {
  const planets = Object.values(PLANETS_DATA);

  return (
    <div className={styles.planetSelector}>
      {planets.map(planet => (
        <button
          key={planet.id}
          className={`${styles.planetButton} ${selectedPlanet === planet.id ? styles.active : ''}`}
          style={{ '--planet-color': planet.color } as React.CSSProperties}
          onClick={() => onSelectPlanet(planet.id)}
        >
          <span className={styles.planetButtonIcon}>{}</span>
          <span className={styles.planetButtonName}>{planet.name}</span>
        </button>
      ))}
    </div>
  );
};