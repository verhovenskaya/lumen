import React from 'react';
import styles from './LoadingScreen.module.scss';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Загрузка симуляции...' 
}) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <div className={styles.planetLoader}>
          <div className={styles.planet}>
            <div className={styles.ring} />
          </div>
        </div>
        
        <h2 className={styles.title}>{message}</h2>
        
        <div className={styles.progressBar}>
          <div className={styles.progressFill} />
        </div>
        
        <div className={styles.dots}>
          <span className={styles.dot}>.</span>
          <span className={styles.dot}>.</span>
          <span className={styles.dot}>.</span>
        </div>
      </div>
    </div>
  );
};