import React, { useState } from 'react';
import { RoverScene } from './RoverScene';
import { useRoverGame } from './hooks/useRoverGame';
import { NovelScreen } from './components/NovelScreen';
import { BriefingScreen } from './components/BriefingScreen';
import { GameHUD } from './components/GameHUD';
import { GameOverlay } from './components/GameOverlay';
import styles from './RoverGame.module.scss';

interface Props {
  onClose: () => void;
  onWin?: () => void;
}

export const RoverGame: React.FC<Props> = ({ onClose, onWin }) => {
  const {
    screen, novelStep, roverRef, keysRef, roverUI, score, timeLeft,
    gameOver, gameWon, craters, showTutorial, stormActive, stormWarning, scanActive, scanCooldown,
    handleCollect, startGame, nextNovel, goToBriefing,
  } = useRoverGame(onWin);

  const [isMaximized, setIsMaximized] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const onTitleDown = (e: React.MouseEvent) => {
    if (isMaximized) return;
    setDragging(true);
    setDragStart({ x: e.clientX - pos.x, y: e.clientY - pos.y });
  };

  React.useEffect(() => {
    if (!dragging) return;
    const m = (e: MouseEvent) => setPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    const u = () => setDragging(false);
    window.addEventListener('mousemove', m);
    window.addEventListener('mouseup', u);
    return () => { window.removeEventListener('mousemove', m); window.removeEventListener('mouseup', u); };
  }, [dragging, dragStart]);

  return (
    <div className={`${styles.overlay} ${isMaximized ? styles.maximized : ''}`}>
      <div className={`${styles.container} ${isMaximized ? styles.fullscreen : ''}`}
        style={!isMaximized ? { left: pos.x || 'auto', top: pos.y || 'auto', transform: 'none' } : {}}>
        
        <div className={styles.titleBar} onMouseDown={onTitleDown}>
          <div className={styles.titleLeft}>
            <span className={styles.titleIcon}>🟠</span>
            <span className={styles.titleText}>Марсоход-исследователь{screen === 'game' ? ' — Симуляция' : ''}</span>
          </div>
          <div className={styles.titleButtons}>
            <button className={styles.titleBtn} onClick={() => setIsMaximized(!isMaximized)}>{isMaximized ? '❐' : '□'}</button>
            <button className={`${styles.titleBtn} ${styles.closeWinBtn}`} onClick={onClose}>✕</button>
          </div>
        </div>

        <div className={styles.windowBody}>
          {(screen === 'novel1' || screen === 'novel2') && (
            <NovelScreen step={novelStep} onContinue={nextNovel} onToBriefing={goToBriefing} />
          )}
          {screen === 'briefing' && <BriefingScreen onStart={startGame} />}
          {screen === 'game' && (
            <>
              <GameHUD {...{ score, timeLeft, scanCooldown, showTutorial, roverUI, craters, stormActive, stormWarning }} />
              <RoverScene roverRef={roverRef} keysRef={keysRef} craters={craters} scanActive={scanActive} stormActive={stormActive} onCollect={handleCollect} />
              {gameOver && <GameOverlay won={gameWon} score={score} onRestart={startGame} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};