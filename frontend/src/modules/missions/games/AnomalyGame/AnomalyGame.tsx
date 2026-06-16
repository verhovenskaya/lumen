import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import { Planet } from '../../../planets/components/Planet/Planet';
import { OrbitLine } from '../../../simulation/components/OrbitLine';
import { SIMULATION_PLANETS } from '../../../simulation/config/simulation.config';
import styles from './AnomalyGame.module.scss';

interface AnomalyGameProps {
  onClose: () => void;
  onWin?: () => void;
}

interface PlanetPosition {
  id: string;
  name: string;
  correctIndex: number;
  currentIndex: number;
  isCorrect: boolean;
}

const CORRECT_ORDER = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];

const PLANET_NAMES: Record<string, string> = {
  mercury: 'Меркурий', venus: 'Венера', earth: 'Земля', mars: 'Марс',
  jupiter: 'Юпитер', saturn: 'Сатурн', uranus: 'Уран', neptune: 'Нептун',
};

type Screen = 'intro1' | 'intro2' | 'intro3' | 'game';

const shuffleArray = (arr: number[]): number[] => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  if (shuffled.every((v, i) => v === i)) return shuffleArray(arr);
  return shuffled;
};

const Scene3D: React.FC<{
  planets: PlanetPosition[];
  selected: string | null;
  onSelect: (id: string) => void;
}> = ({ planets, selected, onSelect }) => {
  const sortedPlanets = [...planets].sort((a, b) => a.currentIndex - b.currentIndex);
  const orbitRadii = [5, 7, 9, 11.5, 14.5, 18, 21.5, 25];
  const sunPlanet = SIMULATION_PLANETS.find(p => p.id === 'sun');
  const sizeScale: Record<string, number> = {
  mercury: 0.6,
  venus: 0.7,
  earth: 0.7,
  mars: 0.65,
  jupiter: 1.0,
  saturn: 0.9,
  uranus: 0.8,
  neptune: 0.8,
};

  return (
    <>
      <ambientLight intensity={0.5} />
      <group position={[0, 0, 0]}>{sunPlanet && <Planet config={{ ...sunPlanet, scale: 1.8 }} />}</group>
      <pointLight position={[0, 0, 0]} intensity={10} color="#fff8dd" distance={80} />
      <pointLight position={[0, 0, 0]} intensity={5} color="#ffcc44" distance={50} />
      <pointLight position={[0, 0, 0]} intensity={2} color="#ff8800" distance={25} />

      {sortedPlanets.map((planet) => (
        <OrbitLine
          key={`orbit-${planet.id}`}
          radius={orbitRadii[planet.correctIndex]}
          color="rgba(172, 152, 212, 1)"
        />
      ))}

      {sortedPlanets.map((planet) => {
        const simPlanet = SIMULATION_PLANETS.find(p => p.id === planet.id);
        if (!simPlanet) return null;
        const orbitRadius = orbitRadii[planet.currentIndex];
        const angle = (planet.currentIndex / 8) * Math.PI * 2 + 0.2;
        const x = Math.cos(angle) * orbitRadius;
        const z = Math.sin(angle) * orbitRadius;
        const isSelected = selected === planet.id;
        const isCorrect = planet.currentIndex === planet.correctIndex;

        return (
          <group key={planet.id} position={[x, 0, z]}>
            <Planet config={{ ...simPlanet, scale: (sizeScale[planet.id] || 0.1) * (isSelected ? 1.5 : 1) }} />
            <Html position={[0, 0.35, 0]} center>
              <div
                style={{
                  color: '#fff', fontFamily: 'Segoe UI, sans-serif', fontSize: '20px',
                  textAlign: 'center', cursor: 'pointer', padding: '2px 6px',
                  background: isSelected ? 'rgba(172,152,212,0.9)' : isCorrect ? 'rgba(68,255,68,0.2)' : 'rgba(251,119,242,0.2)',
                  borderRadius: '4px', whiteSpace: 'nowrap',
                }}
                onClick={(e) => { e.stopPropagation(); onSelect(planet.id); }}
              >
                {PLANET_NAMES[planet.id]}
              </div>
            </Html>
          </group>
        );
      })}

      <Stars radius={60} count={400} factor={2} />
      <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} target={[0, 0, 0]} maxDistance={60} />
    </>
  );
};

export const AnomalyGame: React.FC<AnomalyGameProps> = ({ onClose, onWin }) => {
  const [screen, setScreen] = useState<Screen>('intro1');
  const [planets, setPlanets] = useState<PlanetPosition[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(240);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  const startGame = useCallback(() => {
    const indices = CORRECT_ORDER.map((_, i) => i);
    const shuffled = shuffleArray(indices);
    setPlanets(CORRECT_ORDER.map((id, i) => ({
      id, name: PLANET_NAMES[id], correctIndex: i, currentIndex: shuffled[i], isCorrect: shuffled[i] === i,
    })));
    setSelected(null); setTimeLeft(240); setGameOver(false); setGameWon(false); setScreen('game');
  }, []);

  useEffect(() => {
    if (screen !== 'game' || gameOver) return;
    const timer = setInterval(() => setTimeLeft(prev => prev <= 1 ? (setGameOver(true), 0) : prev - 1), 1000);
    return () => clearInterval(timer);
  }, [screen, gameOver]);

  useEffect(() => { if (gameWon && onWin) onWin(); }, [gameWon, onWin]);

  const handleTitleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e: MouseEvent) => setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    const handleUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); };
  }, [isDragging, dragStart]);

  const handleSelect = (planetId: string) => {
    if (gameOver) return;
    if (!selected) { setSelected(planetId); return; }
    if (selected === planetId) { setSelected(null); return; }
    setPlanets(prev => {
      const p1 = prev.find(p => p.id === selected)!;
      const p2 = prev.find(p => p.id === planetId)!;
      const updated = prev.map(p => {
        if (p.id === selected) return { ...p, currentIndex: p2.currentIndex, isCorrect: p2.currentIndex === p.correctIndex };
        if (p.id === planetId) return { ...p, currentIndex: p1.currentIndex, isCorrect: p1.currentIndex === p.correctIndex };
        return p;
      });
      if (updated.every(p => p.currentIndex === p.correctIndex)) { setGameWon(true); setGameOver(true); }
      return updated;
    });
    setSelected(null);
  };

  const correctCount = planets.filter(p => p.currentIndex === p.correctIndex).length;
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className={`${styles.overlay} ${isMaximized ? styles.maximized : ''}`}>
      <div
        ref={windowRef}
        className={`${styles.container} ${isMaximized ? styles.fullscreen : ''}`}
        style={!isMaximized ? { left: position.x || 'auto', top: position.y || 'auto', transform: 'none' } : {}}
      >
        <div className={styles.titleBar} onMouseDown={handleTitleMouseDown}>
          <div className={styles.titleLeft}>
            <span className={styles.titleText}>Планетарный ряд{screen === 'game' ? ' — Аномалии' : ''}</span>
          </div>
          <div className={styles.titleButtons}>
            <button className={styles.titleBtn} onClick={() => setIsMaximized(!isMaximized)}>
              {isMaximized ? '❐' : '□'}
            </button>
            <button className={`${styles.titleBtn} ${styles.closeWinBtn}`} onClick={onClose}>✕</button>
          </div>
        </div>

        <div className={styles.windowBody}>
          {screen === 'intro1' && (
            <div className={styles.introScreen}>
              <h2 className={styles.introTitle}>АНОМАЛИИ</h2>
              <p className={styles.introText}>В Солнечной системе произошёл сбой.<br/>Планеты поменялись местами!</p>
              <button className={styles.nextBtn} onClick={() => setScreen('intro2')}>ДАЛЕЕ →</button>
            </div>
          )}
          {screen === 'intro2' && (
            <div className={styles.introScreen}>
              <h2 className={styles.introTitle}>ДЕТЕКТИВ</h2>
              <p className={styles.introText}>Найди аномалии и верни планеты на свои места!</p>
              <button className={styles.nextBtn} onClick={() => setScreen('intro3')}>ДАЛЕЕ →</button>
            </div>
          )}
          {screen === 'intro3' && (
            <div className={styles.introScreen}>
              <h2 className={styles.introTitle}>УПРАВЛЕНИЕ</h2>
              <p className={styles.introText}>Кликни на планету, затем на другую — они поменяются.</p>
              <button className={styles.startMissionBtn} onClick={startGame}>НАЧАТЬ МИССИЮ</button>
            </div>
          )}
          {screen === 'game' && (
            <>
              <div className={styles.hud}>
                <div className={styles.hudItem}>
                  <span className={styles.hudLabel}>Аномалий</span>
                  <span className={styles.hudValue}>{planets.length - correctCount}</span>
                </div>
                <div className={styles.hudItem}>
                  <span className={styles.hudLabel}>Верно</span>
                  <span className={styles.hudValue}>{correctCount}/8</span>
                </div>
                <div className={styles.hudItem}>
                  <span className={styles.hudLabel}>Время</span>
                  <span className={`${styles.hudTimer} ${timeLeft < 60 ? styles.danger : ''}`}>{formatTime(timeLeft)}</span>
                </div>
              </div>
              <div className={styles.hint}>Размеры планет искажены для удобства прохождения миссии</div>
              <Canvas camera={{ position: [0, 12, 22], fov: 50 }}>
                <Suspense fallback={null}>
                  <Scene3D planets={planets} selected={selected} onSelect={handleSelect} />
                </Suspense>
              </Canvas>
              {gameOver && (
                <div className={styles.gameOverlay}>
                  <h2>{gameWon ? 'АНОМАЛИИ ИСПРАВЛЕНЫ!' : 'ВРЕМЯ ВЫШЛО'}</h2>
                  <p>{gameWon ? 'Солнечная система восстановлена!' : `Исправлено ${correctCount}/8`}</p>
                  <button onClick={startGame}>ЗАНОВО</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};