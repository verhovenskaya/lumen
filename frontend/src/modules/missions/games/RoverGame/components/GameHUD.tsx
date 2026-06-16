import React from 'react';
import { type Crater } from '../config/config';
import styles from '../RoverGame.module.scss';

interface Props {
  score: number;
  timeLeft: number;
  scanCooldown: boolean;
  showTutorial: boolean;
  roverUI: { x: number; z: number };
  craters: Crater[];
  stormActive: boolean;
  stormWarning: boolean;
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

export const GameHUD: React.FC<Props> = ({ score, timeLeft, scanCooldown, showTutorial, roverUI, craters, stormActive, stormWarning }) => (
  <>
    <div className={styles.hud}>
      <div className={styles.hudItem}><span className={styles.hudLabel}>Кратеры</span><span className={styles.hudValue}>{score}/8</span></div>
      <div className={styles.hudItem}><span className={styles.hudLabel}>Сканер</span><span className={`${styles.hudValue} ${scanCooldown ? styles.cooldown : ''}`}>{scanCooldown ? '⚡' : '✓'}</span></div>
      <div className={styles.hudItem}><span className={styles.hudLabel}>Время</span><span className={`${styles.hudTimer} ${timeLeft < 30 ? styles.danger : ''}`}>{fmt(timeLeft)}</span></div>
    </div>

    {showTutorial && (
      <div className={styles.tutorialHint}>
        <span className={styles.tutorialIcon}>🎮</span>
        <div className={styles.tutorialText}>
          <div>Соберите 5 энергетических кратеров</div>
          <div className={styles.tutorialKeys}>
            <span className={styles.keyBadge}>W</span><span className={styles.keyBadge}>A</span><span className={styles.keyBadge}>S</span><span className={styles.keyBadge}>D</span>
            <span style={{ margin: '0 4px', color: 'rgba(255,255,255,0.4)' }}>или</span>
            <span className={styles.keyBadge}>↑</span><span className={styles.keyBadge}>←</span><span className={styles.keyBadge}>↓</span><span className={styles.keyBadge}>→</span>
            <span style={{ margin: '0 4px', color: 'rgba(255,255,255,0.4)' }}>|</span>
            <span className={styles.keyBadge}>ПРОБЕЛ</span>
          </div>
        </div>
      </div>
    )}

    <div className={styles.radarContainer}>
      <div className={styles.radarSweep} />
      {craters.filter(c => !c.collected).map(c => {
        const dx = c.x - roverUI.x, dz = c.z - roverUI.z;
        return <div key={c.id} className={styles.radarDot} style={{ left: `${70 + dx * 1.2}px`, top: `${70 + dz * 1.2}px` }} />;
      })}
    </div>
    {stormWarning && (
  <div className={styles.stormWarning}>
    <span>◈</span><span>ПРИБЛИЖАЕТСЯ ПЫЛЕВАЯ БУРЯ</span>
  </div>
)}

    {stormActive && (
  <div className={`${styles.stormWarning} ${styles.stormActive}`}>
    <span>◆</span><span>ПЫЛЕВАЯ БУРЯ</span>
  </div>
)}
  </>
);