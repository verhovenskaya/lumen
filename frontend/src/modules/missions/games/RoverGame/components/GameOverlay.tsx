import React from 'react';
import styles from '../RoverGame.module.scss';

interface Props {
  won: boolean;
  score: number;
  onRestart: () => void;
}

export const GameOverlay: React.FC<Props> = ({ won, score, onRestart }) => (
  <div className={styles.gameOverlay}>
    <h2>{won ? 'МИССИЯ ВЫПОЛНЕНА' : 'ВРЕМЯ ВЫШЛО'}</h2>
    <p>{won ? 'Марс успешно исследован!' : `Собрано ${score}/8`}</p>
    <button onClick={onRestart}>ЗАНОВО</button>
  </div>
);