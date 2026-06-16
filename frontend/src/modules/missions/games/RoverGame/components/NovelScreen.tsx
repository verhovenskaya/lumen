import React from 'react';
import { NOVEL_SCENES } from '../config/config';
import styles from '../RoverGame.module.scss';

interface Props {
  step: number;
  onContinue: () => void;
  onToBriefing: () => void;
}

export const NovelScreen: React.FC<Props> = ({ step, onContinue, onToBriefing }) => {
  const isLast = step >= NOVEL_SCENES.length - 1;
  return (
    <div className={styles.novelScreen}>
      <div className={`${styles.novelBackground} ${styles[NOVEL_SCENES[step].bgClass]}`}>
        <div className={styles.novelTextBox}>
          <p className={styles.novelNarration}>{NOVEL_SCENES[step].text}</p>
          <button className={styles.novelContinue} onClick={isLast ? onToBriefing : onContinue}>
            {isLast ? 'К ЗАДАНИЮ →' : 'ДАЛЕЕ →'}
          </button>
        </div>
      </div>
    </div>
  );
};