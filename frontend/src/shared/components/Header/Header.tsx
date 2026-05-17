import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRocket, FaUserAstronaut, FaGamepad } from 'react-icons/fa';

import styles from './Header.module.scss';

interface HeaderProps {
  isShifted?: boolean;
  isMissionsOpen?: boolean;
  onMissionsToggle?: () => void;
  onSimulationClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isShifted = false,
  isMissionsOpen = false,
  onMissionsToggle,
  onSimulationClick,
}) => {
  const navigate = useNavigate();

  const handleSimulationClick = () => {
    if (onSimulationClick) {
      onSimulationClick();
    } else {
      navigate('/simulation');
    }
  };

  const handleMissionsClick = () => {
    if (onMissionsToggle) {
      onMissionsToggle();
    } else {
      navigate('/missions');
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

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
        {/* 1. Симуляция */}
        <button
          className={styles.actionButton}
          title="Симуляция"
          onClick={handleSimulationClick}
        >
          <FaGamepad className={styles.icon} />
        </button>

        {/* 2. Миссии */}
        <button
          className={`${styles.actionButton} ${isMissionsOpen ? styles.activeButton : ''}`}
          title={isMissionsOpen ? 'Закрыть миссии' : 'Миссии'}
          onClick={handleMissionsClick}
        >
          <FaRocket className={styles.icon} />
        </button>

        {/* 3. Профиль */}
        <button
          className={`${styles.actionButton} ${styles.profileButton}`}
          title="Профиль"
          onClick={handleProfileClick}
        >
          <FaUserAstronaut className={styles.icon} />
        </button>
      </div>
    </>
  );
};