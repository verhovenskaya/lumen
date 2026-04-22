import React from 'react';
import styles from './Header.module.scss';

export const Header: React.FC = () => {
  const renderLumen = () => {
    const vowels = new Set(['U', 'E']);
    return 'LUMEN'.split('').map((char, i) => (
      <span key={i} className={vowels.has(char) ? styles.vowel : ''}>
        {char}
      </span>
    ));
  };

  return (
    <div className={styles.headerCenter}>
      <div className={styles.group2}>
        <div className={styles.ellipse3} />
        <div className={styles.ellipse1} />
        <div className={styles.ellipse2} />
        <div className={styles.ellipse4} />
      </div>
      <div className={styles.lumen}>{renderLumen()}</div>
    </div>
  );
};