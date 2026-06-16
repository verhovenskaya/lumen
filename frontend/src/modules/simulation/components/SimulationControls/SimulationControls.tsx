import React from 'react';
import styles from './SimulationControls.module.scss';

interface SimulationControlsProps {
  speed: number;
  isPaused: boolean;
  onSpeedUp: () => void;
  onSlowDown: () => void;
  onResetSpeed: () => void;
  onTogglePause: () => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  speed,
  isPaused,
  onSpeedUp,
  onSlowDown,
  onResetSpeed,
  onTogglePause,
}) => {
  // Форматирование скорости для отображения
  const formatSpeed = (speed: number): string => {
    if (speed === 1) return '×1';
    if (speed < 1) return `×${speed.toFixed(3)}`;
    if (speed < 10) return `×${speed.toFixed(1)}`;
    return `×${Math.round(speed)}`;
  };

  return (
    <div className={styles.controls}>
      {/* Декоративные уголки */}
      <div className={styles.cornerLeft} />
      <div className={styles.cornerRight} />
      
      {/* Кнопка паузы/продолжения */}
      <button 
        className={`${styles.controlButton} ${isPaused ? styles.active : ''}`}
        onClick={onTogglePause}
        title={isPaused ? 'Продолжить' : 'Пауза'}
        aria-label={isPaused ? 'Продолжить' : 'Пауза'}
      >
        {isPaused ? '▶' : '⏸'}
      </button>

      <div className={styles.divider} />

      {/* Замедление */}
      <button 
        className={styles.controlButton}
        onClick={onSlowDown}
        title="Замедлить"
        aria-label="Замедлить"
      >
        ◀◀
      </button>

      {/* Отображение текущей скорости (клик для сброса) */}
      <button 
        className={styles.speedDisplay}
        onClick={onResetSpeed}
        title="Сбросить скорость (×1)"
        aria-label="Сбросить скорость"
      >
        {formatSpeed(speed)}
      </button>

      {/* Ускорение */}
      <button 
        className={styles.controlButton}
        onClick={onSpeedUp}
        title="Ускорить"
        aria-label="Ускорить"
      >
        ▶▶
      </button>

      <div className={styles.divider} />

      {/* Кнопка нормальной скорости */}
      <button 
        className={`${styles.controlButton} ${speed === 1 && !isPaused ? styles.active : ''}`}
        onClick={onResetSpeed}
        title="Нормальная скорость (×1)"
        aria-label="Нормальная скорость"
      >
        ×1
      </button>
    </div>
  );
};