import React from 'react';
import styles from './BurgerMenu.module.scss';

interface BurgerMenuProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const BurgerMenu: React.FC<BurgerMenuProps> = ({ isOpen, onToggle }) => {
  if (isOpen) {
    return (
      <div className={styles.closedBurger} onClick={onToggle}>
        <div className={styles.rectangle27Closed} />
        <div className={styles.rectangle29Closed} />
      </div>
    );
  }

  return (
    <button className={styles.burgerMenu} onClick={onToggle}>
      <div className={styles.rectangle27} />
      <div className={styles.rectangle28} />
      <div className={styles.rectangle29} />
    </button>
  );
};