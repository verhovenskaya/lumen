import React from 'react';
import styles from './SpacecraftModal.module.scss'; 

interface SpacecraftModalProps {
  spacecraft: {
    id: string;
    name: string;
    nameRu: string;
    image: string;
    developer: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SpacecraftModal: React.FC<SpacecraftModalProps> = ({ spacecraft, isOpen, onClose }) => {
  if (!isOpen || !spacecraft) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        
        <div className={styles.imageContainer}>
          <img src={spacecraft.image} alt={spacecraft.nameRu} className={styles.image} />
        </div>
        
        <div className={styles.info}>
          <h2 className={styles.name}>{spacecraft.nameRu}</h2>
          <p className={styles.englishName}>{spacecraft.name}</p>
          
          <div className={styles.divider} />
          
          <div className={styles.detailRow}>
            <span className={styles.label}>Разработчик:</span>
            <span className={styles.value}>{spacecraft.developer}</span>
          </div>
          
          <div className={styles.detailRow}>
            <span className={styles.label}>Тип:</span>
            <span className={styles.value}>Космический аппарат</span>
          </div>
          
          <div className={styles.detailRow}>
            <span className={styles.label}>Запуск:</span>
            <span className={styles.value}>—</span>
          </div>
          
          <div className={styles.detailRow}>
            <span className={styles.label}>Статус:</span>
            <span className={styles.value}>Активный</span>
          </div>
          
          <div className={styles.divider} />
          
          <p className={styles.description}>
           NASA API
          </p>
        </div>
      </div>
    </div>
  );
};