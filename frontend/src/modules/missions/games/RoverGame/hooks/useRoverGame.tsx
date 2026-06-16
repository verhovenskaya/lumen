import { useState, useRef, useCallback, useEffect } from 'react';
import { type Crater, type Screen, generateCraters } from '../config/config';

export const useRoverGame = (onWin?: () => void) => {
  const [screen, setScreen] = useState<Screen>('novel1');
  const [novelStep, setNovelStep] = useState(0);
  const roverRef = useRef({ x: 0, z: 0, rotation: 0, velocity: 0 });
  const keysRef = useRef<Record<string, boolean>>({});
  const [roverUI, setRoverUI] = useState({ x: 0, z: 0, rotation: 0 });
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [craters, setCraters] = useState<Crater[]>([]);
  const [showTutorial, setShowTutorial] = useState(true);
  const [stormActive, setStormActive] = useState(false);
  const [stormWarning, setStormWarning] = useState(false);
  const [scanActive, setScanActive] = useState(false);
  const [scanCooldown, setScanCooldown] = useState(false);

  const handleCollect = useCallback((craterId: number) => {
    setCraters(prev => {
      const crater = prev.find(c => c.id === craterId);
      if (!crater || crater.collected) return prev;
      const updated = prev.map(c => c.id === craterId ? { ...c, collected: true } : c);
      const newScore = updated.filter(c => c.collected).length;
      setScore(newScore);
      if (newScore >= 8) {
        setStormActive(false);
        setStormWarning(false);
        setTimeout(() => { setGameWon(true); setGameOver(true); }, 2500);
      }
      return updated;
    });
  }, []);

  const triggerScan = useCallback(() => {
    if (scanCooldown || screen !== 'game' || gameOver) return;
    setScanActive(true);
    setScanCooldown(true);
    setTimeout(() => setScanActive(false), 3000);
    setTimeout(() => setScanCooldown(false), 8000);
  }, [scanCooldown, screen, gameOver]);

  const startGame = useCallback(() => {
    roverRef.current = { x: 0, z: 0, rotation: 0, velocity: 0 };
    setRoverUI({ x: 0, z: 0, rotation: 0 });
    setScore(0);
    setTimeLeft(180);
    setGameOver(false);
    setGameWon(false);
    setCraters(generateCraters());
    setStormActive(false);
    setStormWarning(false);
    setScanActive(false);
    setScanCooldown(false);
    keysRef.current = {};
    setScreen('game');
    setShowTutorial(true);
  }, []);

  const nextNovel = () => setNovelStep(p => Math.min(p + 1, 2));
  const goToBriefing = () => setScreen('briefing');

  useEffect(() => {
    if (screen !== 'game') return;
    const down = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
      if (e.code === 'Space') { e.preventDefault(); triggerScan(); }
    };
    const up = (e: KeyboardEvent) => { keysRef.current[e.key] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [screen, triggerScan]);

  useEffect(() => {
    if (screen !== 'game' || gameOver) return;
    const sync = setInterval(() => setRoverUI({
      x: roverRef.current.x, z: roverRef.current.z, rotation: roverRef.current.rotation
    }), 100);
    return () => clearInterval(sync);
  }, [screen, gameOver]);

  useEffect(() => {
    if (!showTutorial || screen !== 'game') return;
    const check = setInterval(() => {
      const k = keysRef.current;
      if (k['w'] || k['a'] || k['s'] || k['d'] || k[' '] ||
          k['ArrowUp'] || k['ArrowDown'] || k['ArrowLeft'] || k['ArrowRight'] ||
          k['ц'] || k['ф'] || k['ы'] || k['в']) setShowTutorial(false);
    }, 500);
    return () => clearInterval(check);
  }, [showTutorial, screen]);

  useEffect(() => {
    if (screen !== 'game' || gameOver) return;
    const t = setInterval(() => setTimeLeft(prev => prev <= 1 ? (setGameOver(true), 0) : prev - 1), 1000);
    return () => clearInterval(t);
  }, [screen, gameOver]);

  useEffect(() => {
    if (screen !== 'game' || gameOver) return;
    if (timeLeft <= 140 && timeLeft > 10 && !stormWarning && !stormActive) {
      setStormWarning(true);
    }
    if (timeLeft <= 130 && !stormActive) {
      setStormWarning(false);
      setStormActive(true);
    }
  }, [timeLeft, screen, gameOver, stormWarning, stormActive]);

  useEffect(() => { if (gameWon && onWin) onWin(); }, [gameWon, onWin]);

  return {
    screen, novelStep, roverRef, keysRef, roverUI, score, timeLeft,
    gameOver, gameWon, craters, showTutorial, stormActive, stormWarning,
    scanActive, scanCooldown,
    handleCollect, triggerScan, startGame, nextNovel, goToBriefing,
  };
};