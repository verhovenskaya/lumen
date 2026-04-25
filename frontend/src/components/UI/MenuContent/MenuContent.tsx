import React from 'react';
import { MENU_ITEMS } from '../../../config/menu.config';
import styles from './MenuContent.module.scss';

interface MenuContentProps {
  onClose: () => void;
}

export const MenuContent: React.FC<MenuContentProps> = ({ onClose }) => {
  const handleMenuClick = (key: string) => {
    onClose();

    switch (key) {
      case 'Missions':
        window.location.href = '/missions';
        break;
      case 'Spacecraft':
        window.location.href = '/spacecraft';
        break;
      case 'Satellites':
        window.location.href = '/satellites';
        break;
      case 'Chat':
        window.location.href = '/chat';
        break;
      case 'Settings':
        window.location.href = '/settings';
        break;
      default:
        break;
    }
  };

  return (
    <>
      <div className={styles.rectangle31} />
      <div className={styles.menuTitle}>МЕНЮ</div>
      
      {MENU_ITEMS.map((item) => (
        <div 
          key={item.key} 
          className={styles.menuItemWrapper}
          onClick={() => handleMenuClick(item.key)}
        >
          <div className={styles.iconCircle} style={{ top: item.top }}>
            <span className={styles.icon}>{item.icon}</span>
          </div>
          
          <div className={styles[`menu${item.key}`]} style={{ top: item.top }}>
            {item.label}
          </div>
        </div>
      ))}
    </>
  );
};