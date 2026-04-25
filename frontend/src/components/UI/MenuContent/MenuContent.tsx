import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MENU_ITEMS } from '../../../config/menu.config';
import styles from './MenuContent.module.scss';

interface MenuContentProps {
  onClose: () => void;
}

export const MenuContent: React.FC<MenuContentProps> = ({ onClose }) => {
  const navigate = useNavigate();

  const handleMenuClick = (key: string) => {
    onClose();
    
    switch (key) {
      case 'Missions':
        navigate('/missions');
        break;
      case 'Spacecraft':
        navigate('/spacecraft');  
        break;
      case 'Satellites':
        navigate('/satellites');
        break;
      case 'Chat':
        navigate('/chat');
        break;
      case 'Settings':
        navigate('/settings');
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