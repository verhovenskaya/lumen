import React from 'react';
import styles from './Header.module.scss';

interface HeaderProps {
  isShifted?: boolean;  
}

export const Header: React.FC<HeaderProps> = ({ isShifted = false }) => {
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
      
      <button className={styles.profileButton}>
        <div className={styles.profileInner}>
          <span className={styles.profileIcon}>👤</span>
        </div>
      </button>
    </>
  );
};