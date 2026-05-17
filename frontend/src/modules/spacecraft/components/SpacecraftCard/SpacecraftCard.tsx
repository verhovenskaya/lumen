import React from 'react';
import styles from './SpacecraftCard.module.scss';

interface SpacecraftCardProps {
  spacecraft: {
    id: string;
    name: string;
    nameRu: string;
    image: string;
    developer: string;
  };
  onMoreClick?: () => void;
}

export const SpacecraftCard: React.FC<SpacecraftCardProps> = ({ spacecraft, onMoreClick }) => {
  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img src={spacecraft.image} alt={spacecraft.nameRu} className={styles.image} />
      </div>
      
      <div className={styles.info}>
        <h3 className={styles.name}>{spacecraft.nameRu}</h3>
        <p className={styles.englishName}>{spacecraft.name}</p>
        <p className={styles.developer}>{spacecraft.developer}</p>
      </div>
      
      <button className={styles.moreButton} onClick={onMoreClick}>
        <span className={styles.moreText}>Подробнее</span>
        <span className={styles.arrow}>→</span>
      </button>
    </div>
  );
};