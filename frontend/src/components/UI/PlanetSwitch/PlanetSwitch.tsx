import React from 'react';
import { type PlanetConfig } from '../../../config/planets.config';
import styles from './PlanetSwitch.module.scss';

interface PlanetSwitchProps {
  planet: PlanetConfig;
  isActive: boolean;
  onClick: () => void;
}

export const PlanetSwitch: React.FC<PlanetSwitchProps> = ({ planet, isActive, onClick }) => {
  return (
    <>
      {/* Изображение планеты (если есть) */}
      {planet.imageClass && (
        <div className={styles[planet.imageClass]} />
      )}
      
      {/* Переключатель с цветом планеты */}
      {planet.switchClass && (
        <div 
          className={`${styles[planet.switchClass]} ${isActive ? styles.active : ''}`}
          style={{ 
            backgroundColor: planet.color || 'var(--accent-color)',
            '--glow-color': planet.color || 'var(--accent-color)'  // ← CSS-переменная для свечения
          } as React.CSSProperties}
          onClick={onClick}
        />
      )}
      
      {/* Подпись */}
      {planet.labelClass && (
        <div className={styles[planet.labelClass]}>
          {planet.label}
        </div>
      )}
    </>
  );
};