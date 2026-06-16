import React from 'react';
import type { PlanetId, WeatherEvent } from '../types/types';
import { WEATHER_EVENTS } from '../config/config';
import styles from '../PlanetaryWeatherCenter.module.scss';

interface WeatherHUDProps {
  planetId: PlanetId;
  onTriggerEvent: (event: WeatherEvent) => void;
  activeEvent: WeatherEvent | null;
}

export const WeatherHUD: React.FC<WeatherHUDProps> = ({
  planetId,
  onTriggerEvent,
  activeEvent,
}) => {
  const events = WEATHER_EVENTS[planetId] || [];

  const currentData = activeEvent?.atmosphereData || events[0]?.atmosphereData;

  return (
    <div className={styles.weatherHUD}>
      <div className={styles.hudSection}>
        <h3 className={styles.hudTitle}>📊 АТМОСФЕРНЫЕ ДАННЫЕ</h3>
        <div className={styles.hudStats}>
          <div className={styles.hudStat}>
            <span className={styles.statLabel}>🌡️ Температура</span>
            <span className={styles.statValue}>{currentData?.temperature || '—'}</span>
          </div>
          <div className={styles.hudStat}>
            <span className={styles.statLabel}>📊 Давление</span>
            <span className={styles.statValue}>{currentData?.pressure || '—'}</span>
          </div>
          <div className={styles.hudStat}>
            <span className={styles.statLabel}>💨 Ветер</span>
            <span className={styles.statValue}>{currentData?.windSpeed || '—'}</span>
          </div>
          <div className={styles.hudStat}>
            <span className={styles.statLabel}>👁️ Видимость</span>
            <span className={styles.statValue}>{currentData?.visibility || '—'}</span>
          </div>
          <div className={styles.hudStatFull}>
            <span className={styles.statLabel}>🌫️ Состав</span>
            <span className={styles.statValueSmall}>{currentData?.composition || '—'}</span>
          </div>
        </div>
      </div>

      <div className={styles.hudSection}>
        <h3 className={styles.hudTitle}>⚡ АКТИВНЫЕ ЯВЛЕНИЯ</h3>
        <div className={styles.eventsList}>
          {events.map(event => (
            <button
              key={event.id}
              className={`${styles.eventButton} ${activeEvent?.id === event.id ? styles.eventActive : ''}`}
              onClick={() => onTriggerEvent(event)}
            >
              <span className={styles.eventIcon}>{}</span>
              <span className={styles.eventTitle}>{event.title}</span>
            </button>
          ))}
        </div>
      </div>

      {activeEvent && (
        <div className={styles.hudSection}>
          <h3 className={styles.hudTitle}>📖 ОПИСАНИЕ</h3>
          <p className={styles.eventDescription}>{activeEvent.description}</p>
          <div className={styles.eventSource}>
            🔬 Источник: {activeEvent.atmosphereData.source}
          </div>
        </div>
      )}

      <div className={styles.hudFooter}>
        <span>📡 Данные: NASA Planetary Fact Sheet</span>
      </div>
    </div>
  );
};