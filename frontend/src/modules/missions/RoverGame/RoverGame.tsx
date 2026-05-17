import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';

import { RoverScene } from './RoverScene';

import styles from './RoverGame.module.scss';

interface RoverGameProps {
  onClose: () => void;
  onWin?: () => void;
}

interface Crater {
  id: number;
  x: number;
  z: number;
  collected: boolean;
}

interface RoverState {
  x: number;
  z: number;
  rotation: number;
}

const SPEED_FORWARD = 0.18;
const SPEED_BACKWARD = 0.1;
const TURN_SPEED = 0.045;

const MAP_SIZE = 70;

const generateCraters = (): Crater[] => {
  return Array.from({ length: 5 }).map((_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * MAP_SIZE,
    z: (Math.random() - 0.5) * MAP_SIZE,
    collected: false,
  }));
};

type Screen =
  | 'intro1'
  | 'intro2'
  | 'intro3'
  | 'game';

export const RoverGame: React.FC<RoverGameProps> = ({
  onClose,
  onWin,
}) => {
  const [screen, setScreen] = useState<Screen>('intro1');

  const [rover, setRover] = useState<RoverState>({
    x: 0,
    z: 0,
    rotation: 0,
  });

  const [score, setScore] = useState(0);

  const [timeLeft, setTimeLeft] = useState(180);

  const [gameOver, setGameOver] = useState(false);

  const [gameWon, setGameWon] = useState(false);

  const [craters, setCraters] = useState<Crater[]>([]);

  const keysRef = useRef<Record<string, boolean>>({});

  const startGame = useCallback(() => {
    setRover({
      x: 0,
      z: 0,
      rotation: 0,
    });

    setScore(0);

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
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [screen]);

  useEffect(() => {
    if (screen !== 'game' || gameOver) return;

    const loop = setInterval(() => {
      setRover((prev) => {
        const keys = keysRef.current;

        let { x, z, rotation } = prev;

        if (keys['ArrowLeft'] || keys['a'] || keys['ф']) {
          rotation += TURN_SPEED;
        }

        if (keys['ArrowRight'] || keys['d'] || keys['в']) {
          rotation -= TURN_SPEED;
        }

        if (keys['ArrowUp'] || keys['w'] || keys['ц']) {
          x += Math.sin(rotation) * SPEED_FORWARD;
          z += Math.cos(rotation) * SPEED_FORWARD;
        }

        if (keys['ArrowDown'] || keys['s'] || keys['ы']) {
          x -= Math.sin(rotation) * SPEED_BACKWARD;
          z -= Math.cos(rotation) * SPEED_BACKWARD;
        }

        x = Math.max(-MAP_SIZE / 2, Math.min(MAP_SIZE / 2, x));
        z = Math.max(-MAP_SIZE / 2, Math.min(MAP_SIZE / 2, z));

        return { x, z, rotation };
      });
    }, 1000 / 60);

    return () => clearInterval(loop);
  }, [screen, gameOver]);

  // Таймер
  useEffect(() => {
    if (screen !== 'game' || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [screen, gameOver]);

  useEffect(() => {
    if (screen !== 'game' || gameOver || gameWon) return;

    let updatedScore = score;
    let needUpdate = false;

    const updated = craters.map((crater) => {
      if (!crater.collected) {
        const distance = Math.sqrt(
          (rover.x - crater.x) ** 2 + (rover.z - crater.z) ** 2,
        );

        if (distance < 3.2) {
          updatedScore += 1;
          needUpdate = true;
          return { ...crater, collected: true };
        }
      }
      return crater;
    });

    if (needUpdate) {
      setCraters(updated);
      setScore(updatedScore);
      
      if (updatedScore >= 5) {
        setGameWon(true);
        setGameOver(true);
      }
    }
  }, [rover, screen, gameOver, gameWon, craters, score]);

  useEffect(() => {
    if (gameWon && onWin) {
      onWin();
    }
  }, [gameWon, onWin]);

  const formatTime = (seconds: number) => {
    return `${Math.floor(seconds / 60)}:${(seconds % 60)
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <button className={styles.closeBtn} onClick={onClose}>
          ×
        </button>

        {screen === 'intro1' && (
          <div className={styles.introScreen}>
            <div className={styles.introBg}>🟠</div>
            <h2 className={styles.introTitle}>МАРС</h2>
            <p className={styles.introText}>
              Поверхность Марса покрыта огромными кратерами, каньонами и скалами.
            </p>
            <button className={styles.nextBtn} onClick={() => setScreen('intro2')}>
              ДАЛЕЕ →
            </button>
          </div>
        )}

        {screen === 'intro2' && (
          <div className={styles.introScreen}>
            <div className={styles.introBg}>🚘</div>
            <h2 className={styles.introTitle}>РОВЕР</h2>
            <p className={styles.introText}>
              Управляй ровером и исследуй марсианскую поверхность.
            </p>
            <button className={styles.nextBtn} onClick={() => setScreen('intro3')}>
              ДАЛЕЕ →
            </button>
          </div>
        )}

        {screen === 'intro3' && (
          <div className={styles.introScreen}>
            <div className={styles.introBg}>🎯</div>
            <h2 className={styles.introTitle}>ЗАДАНИЕ</h2>
            <p className={styles.introText}>
              Собери 5 энергетических кратеров за 3 минуты.
              <br />
              <br />
              WASD / стрелки — управление.
            </p>
            <button className={styles.startMissionBtn} onClick={startGame}>
              НАЧАТЬ МИССИЮ
            </button>
          </div>
        )}

        {screen === 'game' && (
          <>
            <div className={styles.hud}>
              <span>
                Кратеры: <b>{score}/5</b>
              </span>
              <span className={timeLeft < 30 ? styles.danger : ''}>
                ⏱ {formatTime(timeLeft)}
              </span>
            </div>

            <RoverScene rover={rover} craters={craters} />

            {gameOver && (
              <div className={styles.gameOverlay}>
                <h2>{gameWon ? 'МИССИЯ ВЫПОЛНЕНА' : 'ВРЕМЯ ВЫШЛО'}</h2>
                <p>
                  {gameWon ? 'Марс успешно исследован!' : `Собрано ${score}/5`}
                </p>
                <button onClick={startGame}>ЗАНОВО</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};