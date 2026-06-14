// PuzzleGame.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './PuzzleGame.module.scss';

interface PuzzleGameProps {
  onClose: () => void;
  onWin?: () => void;
}

interface PuzzlePiece {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  placed: boolean;
  imageIndex: number;
}

interface SatelliteInfo {
  id: string;
  name: string;
  image: string;
  info: string;
  launchYear: string;
  country: string;
  orbitHeight: string;
  funFact: string;
}

interface LevelConfig {
  name: string;
  cols: number;
  rows: number;
  pieces: number;
  timeLimit: number;
  starThresholds: [number, number, number];
}

type Screen = 'intro1' | 'intro2' | 'intro3' | 'menu' | 'game' | 'satelliteInfo' | 'complete';

const SATELLITES: SatelliteInfo[] = [
  {
    id: 'gps',
    name: 'GPS-спутник',
    image: '/assets/src/satellite.png',
    info: 'GPS (Global Positioning System) — спутниковая система навигации, обеспечивающая измерение расстояния, времени и определяющая местоположение во всемирной системе координат WGS 84.',
    launchYear: '1978',
    country: 'США',
    orbitHeight: '20 200 км',
    funFact: 'GPS-спутники несут атомные часы, которые отстают на 38 микросекунд в день из-за теории относительности. Без коррекции ошибка составила бы 10 км в день!',
  },
  {
    id: 'hubble',
    name: 'Телескоп Хаббл',
    image: '/assets/src/hubble.jpg',
    info: 'Космический телескоп Хаббл — автоматическая обсерватория на орбите вокруг Земли. Назван в честь Эдвина Хаббла, совершившего революцию в астрономии.',
    launchYear: '1990',
    country: 'США / ЕКА',
    orbitHeight: '547 км',
    funFact: 'Хаббл делает около 150 гигабайт научных данных каждую неделю. За 30 лет работы он провёл более 1,5 миллионов наблюдений!',
  },
  {
    id: 'iss',
    name: 'МКС',
    image: '/assets/src/iss.jpg',
    info: 'Международная космическая станция — пилотируемая орбитальная станция, используемая как многоцелевой космический исследовательский комплекс.',
    launchYear: '1998',
    country: 'Международный проект',
    orbitHeight: '408 км',
    funFact: 'МКС движется со скоростью 7,66 км/с и совершает полный оборот вокруг Земли за 90 минут. Астронавты видят 16 восходов и закатов каждый день!',
  },
  {
    id: 'voyager',
    name: 'Voyager-1',
    image: '/assets/src/voyager.jpg',
    info: 'Voyager-1 — автоматический зонд для исследования дальнего космоса. Самый удалённый от Земли объект, созданный человеком.',
    launchYear: '1977',
    country: 'США',
    orbitHeight: '24+ млрд км от Земли',
    funFact: 'Voyager-1 несёт золотую пластинку с посланием для внеземных цивилизаций, включающую музыку Баха, Моцарта и Чака Берри!',
  },
];

// Только 2 уровня: 4 пазла и 16 пазлов
const LEVELS: LevelConfig[] = [
  { name: 'ЛЁГКИЙ', cols: 2, rows: 2, pieces: 4, timeLimit: 120, starThresholds: [30, 60, 120] },
  { name: 'СРЕДНИЙ', cols: 4, rows: 4, pieces: 16, timeLimit: 240, starThresholds: [60, 120, 240] },
];

interface LevelProgress {
  stars: number;
  bestTime: number | null;
}

// Функция генерации пазлов с улучшенным позиционированием
const generatePieces = (satellite: SatelliteInfo, level: LevelConfig, containerWidth: number, containerHeight: number): PuzzlePiece[] => {
  const pieces: PuzzlePiece[] = [];
  const count = level.pieces;
  
  // Динамический размер пазлов — занимают больше пространства
  const maxPieceWidth = Math.min(220, (containerWidth - 60) / level.cols);
  const maxPieceHeight = Math.min(220, (containerHeight - 120) / level.rows);
  const pieceW = Math.max(80, maxPieceWidth);
  const pieceH = Math.max(80, maxPieceHeight);
  
  const totalW = level.cols * pieceW;
  const totalH = level.rows * pieceH;
  const offsetX = Math.max(20, (containerWidth - totalW) / 2);
  const offsetY = Math.max(40, (containerHeight - totalH) / 2);

  for (let i = 0; i < count; i++) {
    const col = i % level.cols;
    const row = Math.floor(i / level.cols);
    pieces.push({
      id: `piece-${i}`,
      // Случайное начальное положение с учётом границ
      x: Math.random() * (containerWidth - pieceW - 100) + 50,
      y: Math.random() * (containerHeight - pieceH - 120) + 60,
      targetX: offsetX + col * pieceW,
      targetY: offsetY + row * pieceH,
      placed: false,
      imageIndex: i,
    });
  }
  return pieces;
};

const getStars = (time: number, level: LevelConfig): number => {
  if (time <= level.starThresholds[0]) return 3;
  if (time <= level.starThresholds[1]) return 2;
  return 1;
};

const renderStars = (count: number): string => {
  return '★'.repeat(count) + '☆'.repeat(3 - count);
};

export const PuzzleGame: React.FC<PuzzleGameProps> = ({ onClose, onWin }) => {
  const [screen, setScreen] = useState<Screen>('intro1');
  const [selectedSatellite, setSelectedSatellite] = useState<SatelliteInfo>(SATELLITES[0]);
  const [selectedLevel, setSelectedLevel] = useState<LevelConfig>(LEVELS[0]);
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [timeLeft, setTimeLeft] = useState(300);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [showGlow, setShowGlow] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);
  const [isMaximized, setIsMaximized] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDraggingWindow, setIsDraggingWindow] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [levelProgress, setLevelProgress] = useState<Record<string, Record<string, LevelProgress>>>({});
  const windowRef = useRef<HTMLDivElement>(null);
  const puzzleAreaRef = useRef<HTMLDivElement>(null);

  const startGame = useCallback(() => {
    const w = puzzleAreaRef.current?.clientWidth || window.innerWidth * 0.85;
    const h = puzzleAreaRef.current?.clientHeight || window.innerHeight * 0.7;
    setPieces(generatePieces(selectedSatellite, selectedLevel, w, h));
    setTimeLeft(selectedLevel.timeLimit);
    setElapsedTime(0);
    setGameOver(false);
    setGameWon(false);
    setShowGlow(false);
    setEarnedStars(0);
    setScreen('game');
  }, [selectedSatellite, selectedLevel]);

  const showSatelliteInfo = useCallback((satellite: SatelliteInfo) => {
    setSelectedSatellite(satellite);
    setScreen('satelliteInfo');
  }, []);

  const selectLevel = useCallback((level: LevelConfig) => {
    setSelectedLevel(level);
    startGame();
  }, [startGame]);

  useEffect(() => {
    if (screen !== 'game' || gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { setGameOver(true); return 0; }
        return prev - 1;
      });
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [screen, gameOver]);

  useEffect(() => {
    if (gameWon && onWin) onWin();
  }, [gameWon, onWin]);

  const handleTitleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return;
    setIsDraggingWindow(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  useEffect(() => {
    if (!isDraggingWindow) return;
    const handleMouseMove = (e: MouseEvent) => setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    const handleMouseUp = () => setIsDraggingWindow(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingWindow, dragStart]);

  const handleMouseDown = (e: React.MouseEvent, pieceId: string) => {
    const piece = pieces.find(p => p.id === pieceId);
    if (!piece || piece.placed) return;
    e.stopPropagation();
    setDragging(pieceId);
    setDragOffset({ x: e.clientX - piece.x, y: e.clientY - piece.y });
  };

  // Логика перетаскивания и проверки завершения
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      setPieces(prev => prev.map(p => p.id === dragging ? { ...p, x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y } : p));
    };
    
    const handleMouseUp = () => {
      if (!dragging) return;
      
      setPieces(prev => {
        const piece = prev.find(p => p.id === dragging);
        if (!piece) return prev;
        
        const dist = Math.hypot(piece.x - piece.targetX, piece.y - piece.targetY);
        const snap = dist < 45;
        
        const updatedPieces = prev.map(p => 
          p.id === dragging ? { ...p, x: snap ? p.targetX : p.x, y: snap ? p.targetY : p.y, placed: p.placed || snap } : p
        );
        
        // Проверка на завершение всех пазлов
        if (snap && updatedPieces.every(p => p.placed)) {
          const stars = getStars(elapsedTime, selectedLevel);
          setEarnedStars(stars);
          setGameWon(true);
          setGameOver(true);
          setShowGlow(true);
          
          // Сохранение прогресса
          setLevelProgress(prevProgress => ({
            ...prevProgress,
            [selectedSatellite.id]: {
              ...prevProgress[selectedSatellite.id],
              [selectedLevel.name]: {
                stars: Math.max(stars, prevProgress[selectedSatellite.id]?.[selectedLevel.name]?.stars || 0),
                bestTime: prevProgress[selectedSatellite.id]?.[selectedLevel.name]?.bestTime
                  ? Math.min(elapsedTime, prevProgress[selectedSatellite.id][selectedLevel.name].bestTime!)
                  : elapsedTime,
              },
            },
          }));
        }
        return updatedPieces;
      });
      setDragging(null);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, dragOffset, elapsedTime, selectedSatellite.id, selectedLevel]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const getPieceStyle = (piece: PuzzlePiece) => {
    const containerWidth = puzzleAreaRef.current?.clientWidth || 1000;
    const containerHeight = puzzleAreaRef.current?.clientHeight || 700;
    
    const pieceW = Math.min(220, (containerWidth - 60) / selectedLevel.cols);
    const pieceH = Math.min(220, (containerHeight - 120) / selectedLevel.rows);
    const totalW = selectedLevel.cols * pieceW;
    const totalH = selectedLevel.rows * pieceH;
    
    return {
      width: pieceW,
      height: pieceH,
      backgroundImage: `url(${selectedSatellite.image})`,
      backgroundSize: `${totalW}px ${totalH}px`,
      backgroundPosition: `-${piece.imageIndex % selectedLevel.cols * pieceW}px -${Math.floor(piece.imageIndex / selectedLevel.cols) * pieceH}px`,
      backgroundRepeat: 'no-repeat' as const,
    };
  };

  const getProgressForLevel = (satelliteId: string, levelName: string): LevelProgress => {
    return levelProgress[satelliteId]?.[levelName] || { stars: 0, bestTime: null };
  };

  return (
    <div className={`${styles.overlay} ${isMaximized ? styles.maximized : ''}`}>
      <div 
        ref={windowRef} 
        className={`${styles.container} ${isMaximized ? styles.fullscreen : ''}`}
        style={!isMaximized && (position.x !== 0 || position.y !== 0) ? { left: position.x, top: position.y, transform: 'none' } : undefined}
      >
        <div className={styles.titleBar} onMouseDown={handleTitleMouseDown}>
          <div className={styles.titleLeft}>
            <span className={styles.titleText}>
              Спутниковый конструктор{screen === 'game' ? ` — ${selectedSatellite.name} (${selectedLevel.name})` : ''}
            </span>
          </div>
          <div className={styles.titleButtons}>
            <button className={styles.titleBtn} onClick={() => setIsMaximized(!isMaximized)}>
              {isMaximized ? '❐' : '□'}
            </button>
            <button className={`${styles.titleBtn} ${styles.closeWinBtn}`} onClick={onClose}>✕</button>
          </div>
        </div>

        <div className={styles.windowBody}>
          {/* INTRO SCREENS */}
          {screen === 'intro1' && (
            <div className={styles.introScreen}>
              <h2 className={styles.introTitle}>ОРБИТАЛЬНАЯ ГРУППИРОВКА</h2>
              <p className={styles.introText}>Тысячи спутников вращаются вокруг Земли.<br/>Каждый из них — чудо инженерной мысли.</p>
              <button className={styles.nextBtn} onClick={() => setScreen('intro2')}>ДАЛЕЕ</button>
            </div>
          )}
          {screen === 'intro2' && (
            <div className={styles.introScreen}>
              <h2 className={styles.introTitle}>ОБРАЗОВАТЕЛЬНАЯ МИССИЯ</h2>
              <p className={styles.introText}>Собирай пазлы и узнавай интересные факты<br/>о космических аппаратах.</p>
              <button className={styles.nextBtn} onClick={() => setScreen('intro3')}>ДАЛЕЕ</button>
            </div>
          )}
          {screen === 'intro3' && (
            <div className={styles.introScreen}>
              <h2 className={styles.introTitle}>УРОВНИ СЛОЖНОСТИ</h2>
              <p className={styles.introText}>
                От 4 до 16 деталей. Собирай быстрее —<br/>получай больше звёзд!
              </p>
              <div className={styles.starLegend}>
                <span>{renderStars(3)} &lt; {LEVELS[0].starThresholds[0]}с</span>
                <span>{renderStars(2)} &lt; {LEVELS[0].starThresholds[1]}с</span>
                <span>{renderStars(1)} за завершение</span>
              </div>
              <button className={styles.startMissionBtn} onClick={() => setScreen('menu')}>К ВЫБОРУ СПУТНИКА</button>
            </div>
          )}

          {/* MENU — выбор спутника */}
          {screen === 'menu' && (
            <div className={styles.menuScreen}>
              <h2 className={styles.menuTitle}>ВЫБЕРИТЕ СПУТНИК</h2>
              <div className={styles.satelliteGrid}>
                {SATELLITES.map(sat => (
                  <div key={sat.id} className={styles.satelliteCard} onClick={() => showSatelliteInfo(sat)}>
                    <img src={sat.image} alt={sat.name} className={styles.satelliteThumb} />
                    <div className={styles.satelliteCardName}>{sat.name}</div>
                    <div className={styles.satelliteCardYear}>{sat.launchYear}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SATELLITE INFO — информация о спутнике + выбор уровня */}
          {screen === 'satelliteInfo' && (
            <div className={styles.satelliteInfoScreen}>
              <div className={styles.satelliteInfoLeft}>
                <img src={selectedSatellite.image} alt={selectedSatellite.name} className={styles.satelliteInfoImage} />
              </div>
              <div className={styles.satelliteInfoRight}>
                <h2 className={styles.satelliteInfoTitle}>{selectedSatellite.name}</h2>
                <div className={styles.satelliteInfoStats}>
                  <div className={styles.statItem}><span className={styles.statLabel}>Запуск</span><span className={styles.statValue}>{selectedSatellite.launchYear}</span></div>
                  <div className={styles.statItem}><span className={styles.statLabel}>Страна</span><span className={styles.statValue}>{selectedSatellite.country}</span></div>
                  <div className={styles.statItem}><span className={styles.statLabel}>Орбита</span><span className={styles.statValue}>{selectedSatellite.orbitHeight}</span></div>
                </div>
                <p className={styles.satelliteInfoDesc}>{selectedSatellite.info}</p>
                <div className={styles.funFact}>
                  <span className={styles.funFactLabel}>ИНТЕРЕСНЫЙ ФАКТ</span>
                  <p>{selectedSatellite.funFact}</p>
                </div>
                <h3 className={styles.levelSelectTitle}>ВЫБЕРИТЕ УРОВЕНЬ СЛОЖНОСТИ</h3>
                <div className={styles.levelGrid}>
                  {LEVELS.map(level => {
                    const progress = getProgressForLevel(selectedSatellite.id, level.name);
                    return (
                      <div key={level.name} className={styles.levelCard} onClick={() => selectLevel(level)}>
                        <div className={styles.levelName}>{level.name}</div>
                        <div className={styles.levelPieces}>{level.pieces} деталей</div>
                        <div className={styles.levelStars}>
                          {progress.stars > 0 ? renderStars(progress.stars) : '☆ ☆ ☆'}
                        </div>
                        {progress.bestTime && (
                          <div className={styles.levelBestTime}>Лучшее: {formatTime(progress.bestTime)}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <button className={styles.backBtn} onClick={() => setScreen('menu')}>← К СПУТНИКАМ</button>
              </div>
            </div>
          )}

          {/* GAME */}
          {screen === 'game' && (
            <>
              <div className={styles.hud}>
                <div className={styles.hudItem}>
                  <span className={styles.hudLabel}>Спутник</span>
                  <span className={styles.hudValue}>{selectedSatellite.name}</span>
                </div>
                <div className={styles.hudItem}>
                  <span className={styles.hudLabel}>Уровень</span>
                  <span className={styles.hudValue}>{selectedLevel.name}</span>
                </div>
                <div className={styles.hudItem}>
                  <span className={styles.hudLabel}>Детали</span>
                  <span className={styles.hudValue}>{pieces.filter(p => p.placed).length}/{selectedLevel.pieces}</span>
                </div>
                <div className={styles.hudItem}>
                  <span className={styles.hudLabel}>Время</span>
                  <span className={`${styles.hudTimer} ${timeLeft < 60 ? styles.danger : ''}`}>{formatTime(timeLeft)}</span>
                </div>
              </div>
              <div className={styles.puzzleArea} ref={puzzleAreaRef}>
                {/* Целевые зоны (тени) */}
                {pieces.map(p => !p.placed && (
                  <div 
                    key={`target-${p.id}`} 
                    className={styles.targetSpot} 
                    style={{ 
                      left: p.targetX, 
                      top: p.targetY, 
                      width: getPieceStyle(p).width, 
                      height: getPieceStyle(p).height 
                    }} 
                  />
                ))}
                {/* Размещённые пазлы */}
                {pieces.filter(p => p.placed).map(p => (
                  <div 
                    key={`placed-${p.id}`} 
                    className={`${styles.piece} ${styles.placed}`} 
                    style={{ left: p.targetX, top: p.targetY, ...getPieceStyle(p) }} 
                  />
                ))}
                {/* Перетаскиваемые пазлы */}
                {pieces.filter(p => !p.placed).map(p => (
                  <div 
                    key={p.id} 
                    className={`${styles.piece} ${dragging === p.id ? styles.dragging : ''}`} 
                    style={{ left: p.x, top: p.y, ...getPieceStyle(p), cursor: 'grab' }} 
                    onMouseDown={e => handleMouseDown(e, p.id)} 
                  />
                ))}
              </div>
            </>
          )}

          {/* GAME OVER OVERLAY */}
          {gameOver && screen === 'game' && (
            <div className={styles.gameOverlay}>
              <h2>{gameWon ? 'ПАЗЛ СОБРАН!' : 'ВРЕМЯ ВЫШЛО'}</h2>
              {gameWon && (
                <div className={styles.starsEarned}>
                  {[1, 2, 3].map(star => (
                    <span key={star} className={`${styles.starIcon} ${star <= earnedStars ? styles.starActive : ''}`}>★</span>
                  ))}
                </div>
              )}
              <p>{gameWon ? `Время: ${formatTime(elapsedTime)}` : `Собрано: ${pieces.filter(p => p.placed).length}/${selectedLevel.pieces}`}</p>
              <div className={styles.gameOverButtons}>
                <button onClick={() => startGame()}>ПОВТОРИТЬ</button>
                <button onClick={() => setScreen('satelliteInfo')}>К УРОВНЯМ</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};