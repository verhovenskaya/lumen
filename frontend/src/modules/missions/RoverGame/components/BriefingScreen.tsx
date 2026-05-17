import React from 'react';
import styles from '../RoverGame.module.scss';

interface Props {
  onStart: () => void;
}

export const BriefingScreen: React.FC<Props> = ({ onStart }) => (
  <div className={styles.novelScreen}>
    <div className={`${styles.novelBackground} ${styles.novelScene3}`}>
      <div className={styles.novelMissionBrief}>
        <h2 className={styles.novelMissionTitle}>ЗАДАНИЕ</h2>
        <p className={styles.novelMissionText}>
          Ваша задача как оператора ровера — собрать образцы из аномальных кратеров.
          У вас есть 3 минуты, чтобы обнаружить и извлечь 8 энергетических ядер.
        </p>
        <div className={styles.novelObjective}><span>🎯</span><span>Цель: собрать 8/8 кратеров</span></div>
        <button className={styles.novelStartBtn} onClick={onStart}>НАЧАТЬ МИССИЮ</button>
      </div>
    </div>
  </div>
);