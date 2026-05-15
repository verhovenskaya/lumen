import React from 'react';
import styles from './Header.module.scss';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  isShifted?: boolean;
  onMissionsClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isShifted = false, onMissionsClick }) => {
  const navigate = useNavigate();

  const renderLumen = () => {
    const vowels = new Set(['U', 'E']);
    return 'LUMEN'.split('').map((char, i) => (
      <span key={i} className={vowels.has(char) ? styles.vowel : ''}>
        {char}
      </span>
    ));
  };

  return (
    <>
      <div className={`${styles.headerCenter} ${isShifted ? styles.shifted : ''}`}>
        <div className={styles.group2}>
          <div className={styles.ellipse3} />
          <div className={styles.ellipse1} />
          <div className={styles.ellipse2} />
          <div className={styles.ellipse4} />
        </div>
        <div className={styles.lumen}>{renderLumen()}</div>
      </div>
      
      <div className={styles.rightGroup}>
        <button className={styles.missionsLink} onClick={onMissionsClick}>
          МИССИИ
        </button>
        <button className={styles.profileButton} onClick={() => navigate('/profile')}>
         
        </button>
      </div>
    </>
  );
};