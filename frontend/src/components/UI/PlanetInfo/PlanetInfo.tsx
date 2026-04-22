import React from 'react';
import { type PlanetConfig } from '../../../config/planets.config';
import planetsData from '../../../data/planetsData.json';
import styles from './PlanetInfo.module.scss';

interface PlanetInfoProps {
  planet: PlanetConfig | null;
  isOpen: boolean;
  onClose: () => void;
}

type PlanetsData = Record<string, {
  type: string;
  mass: string;
  diameter: string;
  gravity: string;
  temperature: string;
  orbitalPeriod: string;
  rotationPeriod: string;
  distanceFromSun: string;
  moons: string;
  description: string;
}>;

export const PlanetInfo: React.FC<PlanetInfoProps> = ({ planet, isOpen, onClose }) => {
  if (!isOpen || !planet) return null;

  const data = (planetsData as PlanetsData)[planet.id];

  if (!data) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.backdrop} onClick={onClose} />
      
      <div className={styles.rightPanel}>
        <button className={styles.closeButton} onClick={onClose}>
          <span>×</span>
        </button>
        
        <div className={styles.planetHeader}>
          <h2 className={styles.planetName}>{planet.label}</h2>
          <p className={styles.planetNameEn}>{planet.name}</p>
        </div>
        
        <div className={styles.divider} />
        
        <div className={styles.infoSection}>
          <div className={styles.infoBlock}>
            <span className={styles.label}>Тип</span>
            <span className={styles.value}>{data.type}</span>
          </div>
        </div>
        
        <div className={styles.divider} />

        <div className={styles.infoSection}>
          <div className={styles.infoBlock}>
            <span className={styles.label}>Масса</span>
            <span className={styles.value}>{data.mass}</span>
          </div>
          
          <div className={styles.infoBlock}>
            <span className={styles.label}>Диаметр</span>
            <span className={styles.value}>{data.diameter}</span>
          </div>
          
          <div className={styles.infoBlock}>
            <span className={styles.label}>Гравитация</span>
            <span className={styles.value}>{data.gravity}</span>
          </div>
          
          <div className={styles.infoBlock}>
            <span className={styles.label}>Температура</span>
            <span className={styles.value}>{data.temperature}</span>
          </div>
        </div>
        
        <div className={styles.divider} />
        
        <div className={styles.infoSection}>
          {data.distanceFromSun !== '—' && (
            <div className={styles.infoBlock}>
              <span className={styles.label}>Расстояние от Солнца</span>
              <span className={styles.value}>{data.distanceFromSun}</span>
            </div>
          )}
          
          <div className={styles.infoBlock}>
            <span className={styles.label}>Орбитальный период</span>
            <span className={styles.value}>{data.orbitalPeriod}</span>
          </div>
          
          <div className={styles.infoBlock}>
            <span className={styles.label}>Период вращения</span>
            <span className={styles.value}>{data.rotationPeriod}</span>
          </div>
          
          {data.moons !== '—' && (
            <div className={styles.infoBlock}>
              <span className={styles.label}>Спутники</span>
              <span className={styles.value}>{data.moons}</span>
            </div>
          )}
        </div>

        <div className={styles.divider} />
        
        <div className={styles.description}>
          <p>{data.description}</p>
        </div>
        
        <div className={styles.footer}>
          <span className={styles.dataSource}>Из головы</span>
        </div>
      </div>
    </div>
  );
};