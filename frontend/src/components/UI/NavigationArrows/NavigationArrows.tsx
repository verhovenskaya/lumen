import React from 'react';
import styles from './NavigationArrows.module.scss';

interface NavigationArrowsProps {
  onPrev: () => void;
  onNext: () => void;
}

export const NavigationArrows: React.FC<NavigationArrowsProps> = ({ onPrev, onNext }) => {
  return (
    <>
      <div className={`${styles.navButton} ${styles.navLeft}`} onClick={onPrev} />
      <div className={`${styles.navButton} ${styles.navRight}`} onClick={onNext} />
    </>
  );
};