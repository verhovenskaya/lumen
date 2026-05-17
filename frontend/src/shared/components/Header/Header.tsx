import React from 'react';
import { useNavigate } from 'react-router-dom';

import styles from './Header.module.scss';

interface HeaderProps {
  isShifted?: boolean;
  onMissionsClick?: () => void;
  onSimulationClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isShifted = false,
  onMissionsClick,
  onSimulationClick,
}) => {
  const navigate = useNavigate();

  const renderLumen = () => {
    const vowels = new Set(['U', 'E']);

    return 'LUMEN'.split('').map((char, i) => (
      <span
        key={i}
        className={vowels.has(char) ? styles.vowel : ''}
      >
        {char}
      </span>
    ));
  };

  return (
    <>
      <div
        className={`${styles.headerCenter} ${
          isShifted ? styles.shifted : ''
        }`}
      >
        <div className={styles.group2}>
          <div className={styles.ellipse3} />
          <div className={styles.ellipse1} />
          <div className={styles.ellipse2} />
          <div className={styles.ellipse4} />
        </div>

        <div className={styles.lumen}>
          {renderLumen()}
        </div>
      </div>

      <div className={styles.rightGroup}>
        <button
          className={styles.actionButton}
          onClick={onSimulationClick}
          title="Симуляция"
        >
          <span className={styles.icon}>🎮</span>
        </button>

        <button
          className={styles.actionButton}
          onClick={onMissionsClick}
          title="Миссии"
        >
          <span className={styles.icon}>🎯</span>
        </button>

        <button
  className={`${styles.actionButton} ${styles.profileButton}`}
  onClick={() => navigate('/profile')}
  title="Профиль"
>
  <div className={styles.profileCircle} />
</button>
      </div>
    </>
  );
};