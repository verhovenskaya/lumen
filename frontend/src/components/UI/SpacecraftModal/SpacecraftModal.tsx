import React, { useState, useEffect } from 'react';
import styles from './SpacecraftModal.module.scss';
import { getVehicleDetail } from '../../../api/nasaApi';

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
  const [detail, setDetail] = useState<{
    missions: string[];
    files: number;
    description: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && spacecraft) {
      setLoading(true);
      getVehicleDetail(spacecraft.name).then(data => {
        if (data) {
          setDetail({
            missions: data.parents?.mission?.map(m => 
              m.mission.split('/mission/').pop() || ''
            ) || [],
            files: data.files?.length || 0,
            description: data.files?.[0]?.description?.substring(0, 300) || 'Информация отсутствует',
          });
        } else {
          setDetail({
            missions: [],
            files: 0,
            description: 'Информация загружается из NASA API...',
          });
        }
        setLoading(false);
      });
    }
  }, [isOpen, spacecraft]);

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
            <span className={styles.label}>Файлов данных:</span>
            <span className={styles.value}>
              {loading ? '...' : detail?.files || 0}
            </span>
          </div>
          
          {detail?.missions.length ? (
            <div className={styles.detailRow}>
              <span className={styles.label}>Миссии:</span>
              <span className={styles.value}>{detail.missions.join(', ')}</span>
            </div>
          ) : null}
          
          <div className={styles.divider} />
          
          <p className={styles.description}>
            {loading ? 'Загрузка...' : detail?.description || 'NASA API'}
          </p>
        </div>
      </div>
    </div>
  );
};