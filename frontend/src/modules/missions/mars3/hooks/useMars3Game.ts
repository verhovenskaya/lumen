import { useCallback, useEffect, useState, useRef } from 'react';
import { type Screen } from '../config';

export const useMars3Game = (onWin?: () => void) => {
  const [screen, setScreen] = useState<Screen>('novel1');
  const [novelStep, setNovelStep] = useState(0);

  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const [timeLeft, setTimeLeft] = useState(180);
  const [attempts, setAttempts] = useState(0);

  const [hint, setHint] = useState('Наведите сканер на поверхность Марса');

  const [cursor, setCursor] = useState({ x: 50, y: 50 });
  const [scanVisible, setScanVisible] = useState(false);

  const [target, setTarget] = useState({ x: 50, y: 50 });

  // 🔥 важное: realtime signal
  const [signalStrength, setSignalStrength] = useState(0);

  const targetRef = useRef(target);
  const cursorRef = useRef(cursor);

  useEffect(() => {
    targetRef.current = target;
  }, [target]);

  useEffect(() => {
    cursorRef.current = cursor;
  }, [cursor]);

  const getSignal = (x: number, y: number) => {
    const dx = x - targetRef.current.x;
    const dy = y - targetRef.current.y;
    const d = Math.sqrt(dx * dx + dy * dy);

    return Math.exp(-d / 18);
  };

  const startGame = useCallback(() => {
    const newTarget = {
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
    };

    setTarget(newTarget);
    setGameWon(false);
    setGameOver(false);
    setAttempts(0);
    setTimeLeft(180);

    setScreen('game');
  }, []);

  const moveCursor = (x: number, y: number) => {
    setCursor({ x, y });

    const signal = getSignal(x, y);
    setSignalStrength(signal * 100);

    if (signal > 0.8) setHint('ПИК СИГНАЛА');
    else if (signal > 0.5) setHint('Сильная аномалия');
    else if (signal > 0.3) setHint('Слабый сигнал');
    else setHint('Фон Марса');
  };

  const scan = () => {
    if (gameOver) return;

    setAttempts((p) => p + 1);
    setScanVisible(true);
    setTimeout(() => setScanVisible(false), 400);

    const signal = getSignal(cursorRef.current.x, cursorRef.current.y);

    if (signal > 0.85) {
      setGameWon(true);
      setGameOver(true);
      setHint('МАРС-3 ОБНАРУЖЕН');

      onWin?.();
    }
  };

  useEffect(() => {
    if (screen !== 'game' || gameOver) return;

    const t = setInterval(() => {
      setTimeLeft((p) => {
        if (p <= 1) {
          setGameOver(true);
          return 0;
        }
        return p - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [screen, gameOver]);

  return {
    screen,
    novelStep,
    setNovelStep,

    startGame,
    moveCursor,
    scan,

    cursor,
    scanVisible,

    attempts,
    hint,

    gameWon,
    gameOver,

    timeLeft,
    signalStrength,
  };
};