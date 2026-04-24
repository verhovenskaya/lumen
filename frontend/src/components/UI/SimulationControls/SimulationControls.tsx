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
  return (
    <div className={styles.controls}>
      <button 
        className={`${styles.controlButton} ${isPaused ? styles.active : ''}`}
        onClick={onTogglePause}
        title={isPaused ? 'Продолжить' : 'Пауза'}
      >
        {isPaused ? '▶' : '⏸'}
      </button>

      <div className={styles.divider} />

      <button 
        className={styles.controlButton}
        onClick={onSlowDown}
        title="Замедлить"
      >
        ◀◀
      </button>

      <button 
        className={styles.speedDisplay}
        onClick={onResetSpeed}
        title="Сбросить скорость"
      >
        ×{speed.toFixed(speed < 1 ? 3 : speed < 10 ? 1 : 0)}
      </button>

      <button 
        className={styles.controlButton}
        onClick={onSpeedUp}
        title="Ускорить"
      >
        ▶▶
      </button>

      <div className={styles.divider} />

      <button 
        className={`${styles.controlButton} ${speed === 1 && !isPaused ? styles.active : ''}`}
        onClick={onResetSpeed}
        title="Нормальная скорость"
      >
        ×1
      </button>
    </div>
  );
};