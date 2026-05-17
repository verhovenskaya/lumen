import React from 'react';
import { useNavigate } from 'react-router-dom';

import { MENU_ITEMS } from '../../config/menu.config';

import styles from './MenuContent.module.scss';

interface MenuContentProps {
  onClose: () => void;
}

export const MenuContent: React.FC<MenuContentProps> = ({
  onClose,
}) => {
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
    <div className={styles.panel}>
      <h3 className={styles.menuTitle}>
        МЕНЮ
      </h3>

      <div className={styles.menuList}>
        {MENU_ITEMS.map((item) => {
  const Icon = item.icon;

  return (
    <div
      key={item.key}
      className={styles.menuItem}
      onClick={() => handleMenuClick(item.key)}
    >
      <Icon className={styles.icon} />

      <span className={styles.menuLabel}>
        {item.label}
      </span>
    </div>
  );
})}
      </div>
    </div>
  );
};