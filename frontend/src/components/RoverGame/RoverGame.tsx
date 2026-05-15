import React, { useState, useEffect, useCallback } from 'react';
import { RoverScene } from './RoverScene';
import styles from './RoverGame.module.scss';

interface RoverGameProps {
  onClose: () => void;
  onWin?: () => void;
}
const SPEED_FORWARD = 3.0;
const SPEED_BACKWARD = 2.05;
const TURN_SPEED = 3;
type Screen = 'intro1' | 'intro2' | 'intro3' | 'game';

export const RoverGame: React.FC<RoverGameProps> = ({ onClose, onWin }) => {
  const [screen, setScreen] = useState<Screen>('intro1');
  
  const [rover, setRover] = useState({ lat: 0, lon: 0, angle: 0 });
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [craters, setCraters] = useState<{ id: number; lat: number; lon: number; collected: boolean }[]>([]);
  const keysRef = React.useRef<Record<string, boolean>>({});

  const generateCraters = () => {
    return Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      lat: (Math.random() - 0.5) * 70,   
      lon: (Math.random() - 0.5) * 140,  
      collected: false,
    }));
  };

  const startGame = useCallback(() => {
    setRover({ lat: 0, lon: 0, angle: 0 });
    setScore(40);
    setTimeLeft(180);
    setGameOver(false);
    setGameWon(false);
    setCraters(generateCraters());
    keysRef.current = {};
    setScreen('game');
  }, []);

  useEffect(() => {
    if (screen !== 'game') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
    };
    const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.key] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, [screen]);

  useEffect(() => {
    if (screen !== 'game' || gameOver) return;
    
    const loop = setInterval(() => {
      setRover(prev => {
        const k = keysRef.current;
        let { lat, lon, angle } = prev;
        const speed = 3; 
        
       
    if (k['ArrowLeft'] || k['a'] || k['ф']) angle -= TURN_SPEED;
    if (k['ArrowRight'] || k['d'] || k['в']) angle += TURN_SPEED;


    if (k['ArrowUp'] || k['w'] || k['ц']) {
      const angleRad = (angle * Math.PI) / 180;
      lat += Math.cos(angleRad) * SPEED_FORWARD;
      lon += Math.sin(angleRad) * SPEED_FORWARD;
    }


    if (k['ArrowDown'] || k['s'] || k['ы']) {
      const angleRad = (angle * Math.PI) / 180;
      lat -= Math.cos(angleRad) * SPEED_BACKWARD;
      lon -= Math.sin(angleRad) * SPEED_BACKWARD;
    } 
      
        lat = Math.max(-60, Math.min(60, lat));
     
        if (lon > 180) lon -= 360;
        if (lon < -180) lon += 360;
        
        return { lat, lon, angle };
      });
    }, 1000 / 60);
    
    return () => clearInterval(loop);
  }, [screen, gameOver]);


  useEffect(() => {
    if (screen !== 'game' || gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => { if (prev <= 1) { setGameOver(true); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, [screen, gameOver]);

  useEffect(() => {
    if (screen !== 'game') return;
    setCraters(prev => {
      let newScore = score;
      const updated = prev.map(c => {
        if (!c.collected) {
          const dist = Math.sqrt(
            (rover.lat - c.lat) ** 2 + (rover.lon - c.lon) ** 2
          );
          if (dist < 8) { newScore++; return { ...c, collected: true }; }
        }
        return c;
      });
      if (newScore !== score) { setScore(newScore); if (newScore >= 5) { setGameWon(true); setGameOver(true); } }
      return updated;
    });
  }, [rover.lat, rover.lon, screen, score]);

  useEffect(() => { if (gameWon && onWin) onWin(); }, [gameWon, onWin]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <button className={styles.closeBtn} onClick={onClose}>×</button>

        {screen === 'intro1' && (
          <div className={styles.introScreen}>
            <div className={styles.introBg}>🟠</div>
            <h2 className={styles.introTitle}>МАРС</h2>
            <p className={styles.introText}>
              Красная планета — четвёртая от Солнца.<br/>
              Её поверхность покрыта кратерами, вулканами и каньонами.
            </p>
            <button className={styles.nextBtn} onClick={() => setScreen('intro2')}>ДАЛЕЕ →</button>
          </div>
        )}

        {screen === 'intro2' && (
          <div className={styles.introScreen}>
            <div className={styles.introBg}>🛸</div>
            <h2 className={styles.introTitle}>МАРСОХОД</h2>
            <p className={styles.introText}>
              Твоя миссия — управлять ровером на поверхности Марса<br/>
              и собрать 5 кратеров за 3 минуты!
            </p>
            <button className={styles.nextBtn} onClick={() => setScreen('intro3')}>ДАЛЕЕ →</button>
          </div>
        )}

        {screen === 'intro3' && (
          <div className={styles.introScreen}>
            <div className={styles.introBg}>🎯</div>
            <h2 className={styles.introTitle}>УПРАВЛЕНИЕ</h2>
            <p className={styles.introText}>
              <b>W/↑</b> — вперёд<br/>
              <b>A/← D/→</b> — поворот<br/>
              <b>S/↓</b> — назад<br/>
              Собери все 5 за 3 минуты!
            </p>
            <button className={styles.startMissionBtn} onClick={startGame}>НАЧАТЬ МИССИЮ</button>
          </div>
        )}

        {screen === 'game' && (
          <>
            <div className={styles.hud}>
              <span>Кратеры: <b>{score}/5</b></span>
              <span className={timeLeft < 30 ? styles.danger : ''}>⏱ {formatTime(timeLeft)}</span>
            </div>
            <RoverScene rover={rover} craters={craters} />
            {gameOver && (
              <div className={styles.gameOverlay}>
                <h2>{gameWon ? '🎉 МИССИЯ ВЫПОЛНЕНА!' : '⏰ ВРЕМЯ ВЫШЛО'}</h2>
                <p>{gameWon ? `Собрано 5/5 за ${formatTime(180 - timeLeft)}` : `Собрано ${score}/5`}</p>
                <button onClick={startGame}>ЗАНОВО</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};