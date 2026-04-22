import React from 'react';
import { MENU_ITEMS } from '../../../config/menu.config';
import styles from './MenuContent.module.scss';

interface MenuContentProps {
  onClose: () => void;
}

export const MenuContent: React.FC<MenuContentProps> = ({}) => {
  return (
    <>
      <div className={styles.rectangle31} />
      <div className={styles.menuTitle}>МЕНЮ</div>
      
      {MENU_ITEMS.map((item) => (
        <React.Fragment key={item.key}>
          <div className={styles[`menu${item.key}`]} style={{ top: item.top }}>
            {item.label}
          </div>
          <div className={styles[`ellipse${item.key}`]} style={{ top: item.top }} />
          <div className={styles[item.icon]} style={{ top: `calc(${item.top} - 2%)` }} />
        </React.Fragment>
      ))}
    </>
  );
};