import React from 'react';
import styles from './NavigationArrows.module.scss';

interface NavigationArrowsProps {
  onPrev: () => void;
  onNext: () => void;
  isShifted?: boolean;  
}

export const NavigationArrows: React.FC<NavigationArrowsProps> = ({ 
  onPrev, 
  onNext, 
  isShifted = false 
}) => {
  return (
    <>
      <div 
        className={`${styles.navButton} ${styles.navLeft} ${isShifted ? styles.shifted : ''}`} 
        onClick={onPrev} 
      />
      <div 
        className={`${styles.navButton} ${styles.navRight} ${isShifted ? styles.shifted : ''}`} 
        onClick={onNext} 
      />
    </>
  );
};