import React, { useState, useEffect, useRef } from 'react';
import { Scene3D } from '../scene/Scene3D';
import type { PlanetId, WeatherEvent } from '../types/types';
import { PLANETS_DATA, WEATHER_EVENTS } from '../config/config';
import styles from './PlanetaryWeatherCenter.module.scss';

interface PlanetaryWeatherCenterProps {
  onClose: () => void;
  onWin?: () => void;
}

type Screen = 'intro' | 'main';

const AVAILABLE_PLANETS: PlanetId[] = ['mars', 'venus', 'neptune'];

export const PlanetaryWeatherCenter: React.FC<PlanetaryWeatherCenterProps> = ({ onClose, onWin }) => {
  const [screen, setScreen] = useState<Screen>('intro');
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetId>('mars');
  const [activeEvent, setActiveEvent] = useState<WeatherEvent | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  const currentEvents = WEATHER_EVENTS[selectedPlanet] || [];

  const handleTitleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    };
    const handleUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isDragging, dragStart]);

  const handleEventClick = (event: WeatherEvent) => {
    setActiveEvent(activeEvent?.id === event.id ? null : event);
  };

  const getActiveData = () => {
    if (activeEvent) return activeEvent.atmosphereData;
    return currentEvents[0]?.atmosphereData;
  };

  const activeData = getActiveData();

  return (
    <div className={`${styles.overlay} ${isMaximized ? styles.maximized : ''}`}>
      <div
        ref={windowRef}
        className={`${styles.container} ${isMaximized ? styles.fullscreen : ''}`}
        style={!isMaximized && (position.x !== 0 || position.y !== 0) ? { left: position.x, top: position.y, transform: 'none' } : {}}
      >
        <div className={styles.titleBar} onMouseDown={handleTitleMouseDown}>
          <div className={styles.titleLeft}>
            <span className={styles.titleText}>Атмосферная обсерватория</span>
          </div>
          <div className={styles.titleButtons}>
            <button className={styles.titleBtn} onClick={() => setIsMaximized(!isMaximized)}>
              {isMaximized ? '❐' : '□'}
            </button>
            <button className={`${styles.titleBtn} ${styles.closeWinBtn}`} onClick={onClose}>✕</button>
          </div>
        </div>

        <div className={styles.windowBody}>
          {screen === 'intro' && (
            <div className={styles.introScreen}>
              <h2 className={styles.introTitle}>АТМОСФЕРНАЯ ОБСЕРВАТОРИЯ</h2>
              <p className={styles.introText}>
                Исследуйте уникальные погодные явления планет Солнечной системы
                <br />
                на основе реальных данных NASA
              </p>
              <button className={styles.startBtn} onClick={() => setScreen('main')}>
                НАЧАТЬ ИССЛЕДОВАНИЕ
              </button>
            </div>
          )}

          {screen === 'main' && (
            <>
              <div className={styles.planetBar}>
                {AVAILABLE_PLANETS.map(planetId => {
                  const planet = PLANETS_DATA[planetId];
                  return (
                    <button
                      key={planetId}
                      className={`${styles.planetDot} ${selectedPlanet === planetId ? styles.active : ''}`}
                      onClick={() => {
                        setSelectedPlanet(planetId);
                        setActiveEvent(null);
                      }}
                      title={planet.name}
                    />
                  );
                })}
              </div>

              <div className={styles.mainContent}>
                <div className={styles.scenePanel}>
                  <Scene3D planetId={selectedPlanet} activeEvent={activeEvent?.id || null} />
                </div>

                <div className={styles.infoPanel}>
                  <div className={styles.planetName}>
                    {PLANETS_DATA[selectedPlanet]?.name}
                  </div>

                  {/* Атмосферные данные */}
                  <div className={styles.dataSection}>
                    <div className={styles.dataRow}>
                      <span className={styles.dataLabel}>Температура</span>
                      <span className={styles.dataValue}>{activeData?.temperature || '—'}</span>
                    </div>
                    <div className={styles.dataRow}>
                      <span className={styles.dataLabel}>Давление</span>
                      <span className={styles.dataValue}>{activeData?.pressure || '—'}</span>
                    </div>
                    <div className={styles.dataRow}>
                      <span className={styles.dataLabel}>Ветер</span>
                      <span className={styles.dataValue}>{activeData?.windSpeed || '—'}</span>
                    </div>
                    <div className={styles.dataRow}>
                      <span className={styles.dataLabel}>Видимость</span>
                      <span className={styles.dataValue}>{activeData?.visibility || '—'}</span>
                    </div>
                    <div className={styles.dataRowFull}>
                      <span className={styles.dataLabel}>Состав</span>
                      <span className={styles.dataValueSmall}>{activeData?.composition || '—'}</span>
                    </div>
                  </div>

                  <div className={styles.divider} />

                  <div className={styles.eventsSection}>
                    <div className={styles.eventsGrid}>
                      {currentEvents.map(event => (
                        <button
                          key={event.id}
                          className={`${styles.eventButton} ${activeEvent?.id === event.id ? styles.eventActive : ''}`}
                          onClick={() => handleEventClick(event)}
                        >
                          <span className={styles.eventTitle}>{event.title}</span>
                        </button>
                      ))}
                    </div>
                    
                    {activeEvent && (
                      <div className={styles.eventDescription}>
                        {activeEvent.description}
                      </div>
                    )}
                  </div>

                  <div className={styles.dataSource}>
                    {activeData?.source || 'NASA Planetary Fact Sheet'}
                  </div>
                </div>
              </div>

              <div className={styles.hint}>
                Вращайте камеру • Исследуйте атмосферу
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};