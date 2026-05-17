import React from 'react';
import { type PlanetConfig } from '../../planets.config';
import styles from './PlanetSwitch.module.scss';

interface PlanetSwitchProps {
  planet: PlanetConfig;
  isActive: boolean;
  onClick: () => void;
}

export const PlanetSwitch: React.FC<PlanetSwitchProps> = ({ planet, isActive, onClick }) => {
  return (
    <>
      {planet.imageClass && (
        <div className={styles[planet.imageClass]} />
      )}
    
      {planet.switchClass && (
        <div 
          className={`${styles[planet.switchClass]} ${isActive ? styles.active : ''}`}
          style={{ 
            backgroundColor: planet.color || 'var(--accent-color)',
            '--glow-color': planet.color || 'var(--accent-color)'  
          } as React.CSSProperties}
          onClick={onClick}
        />
      )}
      
      {planet.labelClass && (
        <div className={styles[planet.labelClass]}>
          {planet.label}
        </div>
      )}
    </>
  );
};