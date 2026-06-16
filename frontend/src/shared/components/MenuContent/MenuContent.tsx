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
    // Проверяем, доступен ли пункт
    const item = MENU_ITEMS.find((i) => i.key === key);
    if (item?.disabled) {
      return; 
    }

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
              className={`${styles.menuItem} ${item.disabled ? styles.disabled : ''}`}
              onClick={() => handleMenuClick(item.key)}
            >
              <Icon className={`${styles.icon} ${item.disabled ? styles.iconDisabled : ''}`} />

              <span className={`${styles.menuLabel} ${item.disabled ? styles.labelDisabled : ''}`}>
                {item.label}
                {item.disabled && (
                  <span className={styles.badge}>В разработке</span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};