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

type Screen = 'intro1' | 'intro2' | 'intro3' | 'game' | 'complete';

const PUZZLE_SETS = [
  {
    name: 'GPS-спутник',
    image: '/assets/src/satelitte.png',
    info: 'GPS-спутники обеспечивают навигацию по всему миру. Они передают сигналы, которые позволяют определить местоположение с точностью до нескольких метров.',
    gridCols: 2, gridRows: 2,
    pieceWidth: 130, pieceHeight: 130,
  },
  {
    name: 'Телескоп Хаббл',
    image: '/assets/src/satelitte.png',
    info: 'Телескоп Хаббл — автоматическая обсерватория на орбите Земли. С момента запуска в 1990 году он сделал более 1,5 миллиона снимков.',
    gridCols: 3, gridRows: 3,
    pieceWidth: 130, pieceHeight: 130,
  },
  {
    name: 'МКС',
    image: '/assets/src/satelitte.png',
    info: 'Международная космическая станция — крупнейший научно-технический проект. На ней работают астронавты из разных стран мира.',
    gridCols: 4, gridRows: 4,
    pieceWidth: 130, pieceHeight: 130,
  },
];

const generatePieces = (puzzle: typeof PUZZLE_SETS[0]): PuzzlePiece[] => {
  const pieces: PuzzlePiece[] = [];
  const count = puzzle.gridCols * puzzle.gridRows;
  const totalWidth = puzzle.gridCols * puzzle.pieceWidth;
  const totalHeight = puzzle.gridRows * puzzle.pieceHeight;
  const offsetX = (window.innerWidth * 0.9 - totalWidth) / 2;
  const offsetY = (window.innerHeight * 0.85 - totalHeight) / 2 + 20;

  for (let i = 0; i < count; i++) {
    const col = i % puzzle.gridCols;
    const row = Math.floor(i / puzzle.gridCols);
    pieces.push({
      id: `piece-${i}`,
      x: Math.random() * (totalWidth - 40) + offsetX - 60,
      y: Math.random() * (totalHeight - 40) + offsetY - 80,
      targetX: offsetX + col * puzzle.pieceWidth,
      targetY: offsetY + row * puzzle.pieceHeight,
      placed: false,
      imageIndex: i,
    });
  }
  return pieces;
};

export const PuzzleGame: React.FC<PuzzleGameProps> = ({ onClose, onWin }) => {
  const [screen, setScreen] = useState<Screen>('intro1');
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [timeLeft, setTimeLeft] = useState(300);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [showGlow, setShowGlow] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDraggingWindow, setIsDraggingWindow] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  const startGame = useCallback(() => {
    setCurrentPuzzle(0);
    setPieces(generatePieces(PUZZLE_SETS[0]));
    setTimeLeft(300);
    setGameOver(false);
    setGameWon(false);
    setShowGlow(false);
    setScreen('game');
  }, []);

  const showCompleteScreen = useCallback(() => {
    setShowGlow(true);
    setScreen('complete');
  }, []);

  const nextPuzzle = useCallback(() => {
    const next = currentPuzzle + 1;
    if (next >= PUZZLE_SETS.length) { setGameWon(true); setGameOver(true); }
    else { setShowGlow(false); setCurrentPuzzle(next); setPieces(generatePieces(PUZZLE_SETS[next])); setScreen('game'); }
  }, [currentPuzzle]);

  useEffect(() => { if (screen !== 'game' || gameOver) return;
    const timer = setInterval(() => setTimeLeft(prev => prev <= 1 ? (setGameOver(true), 0) : prev - 1), 1000);
    return () => clearInterval(timer);
  }, [screen, gameOver]);

  useEffect(() => { if (gameWon && onWin) onWin(); }, [gameWon, onWin]);

  const handleTitleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return;
    setIsDraggingWindow(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  useEffect(() => {
    if (!isDraggingWindow) return;
    const m = (e: MouseEvent) => setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    const u = () => setIsDraggingWindow(false);
    window.addEventListener('mousemove', m); window.addEventListener('mouseup', u);
    return () => { window.removeEventListener('mousemove', m); window.removeEventListener('mouseup', u); };
  }, [isDraggingWindow, dragStart]);

  const handleMouseDown = (e: React.MouseEvent, pieceId: string) => {
    const piece = pieces.find(p => p.id === pieceId);
    if (!piece || piece.placed) return;
    setDragging(pieceId);
    setDragOffset({ x: e.clientX - piece.x, y: e.clientY - piece.y });
  };

  useEffect(() => {
    const m = (e: MouseEvent) => { if (!dragging) return; setPieces(prev => prev.map(p => p.id === dragging ? { ...p, x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y } : p)); };
    const u = () => { if (!dragging) return;
      setPieces(prev => {
        const piece = prev.find(p => p.id === dragging); if (!piece) return prev;
        const dist = Math.hypot(piece.x - piece.targetX, piece.y - piece.targetY);
        const upd = prev.map(p => p.id === dragging ? { ...p, x: dist < 40 ? p.targetX : p.x, y: dist < 40 ? p.targetY : p.y, placed: p.placed || dist < 40 } : p);
        if (upd.every(p => p.placed)) showCompleteScreen();
        return upd;
      });
      setDragging(null);
    };
    window.addEventListener('mousemove', m); window.addEventListener('mouseup', u);
    return () => { window.removeEventListener('mousemove', m); window.removeEventListener('mouseup', u); };
  }, [dragging, dragOffset]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const puzzle = PUZZLE_SETS[currentPuzzle];

  const getPieceStyle = (piece: PuzzlePiece) => {
    const col = piece.imageIndex % puzzle.gridCols;
    const row = Math.floor(piece.imageIndex / puzzle.gridCols);
    return {
      width: puzzle.pieceWidth, height: puzzle.pieceHeight,
      backgroundImage: `url(${puzzle.image})`,
      backgroundSize: `${puzzle.gridCols * puzzle.pieceWidth}px ${puzzle.gridRows * puzzle.pieceHeight}px`,
      backgroundPosition: `-${col * puzzle.pieceWidth}px -${row * puzzle.pieceHeight}px`,
    };
  };

  return (
    <div className={`${styles.overlay} ${isMaximized ? styles.maximized : ''}`}>
      <div ref={windowRef} className={`${styles.container} ${isMaximized ? styles.fullscreen : ''}`}
        style={!isMaximized ? { left: position.x || 'auto', top: position.y || 'auto', transform: 'none' } : {}}>

        <div className={styles.titleBar} onMouseDown={handleTitleMouseDown}>
          <div className={styles.titleLeft}><span className={styles.titleText}>Спутниковый конструктор{screen === 'game' ? ' — Пазл' : ''}</span></div>
          <div className={styles.titleButtons}>
            <button className={styles.titleBtn} onClick={() => setIsMaximized(!isMaximized)}>{isMaximized ? '❐' : '□'}</button>
            <button className={`${styles.titleBtn} ${styles.closeWinBtn}`} onClick={onClose}>✕</button>
          </div>
        </div>

        <div className={styles.windowBody}>
          {screen === 'intro1' && (
            <div className={styles.introScreen}>
              <h2 className={styles.introTitle}>СПУТНИКИ</h2>
              <p className={styles.introText}>Тысячи спутников вращаются вокруг Земли.</p>
              <button className={styles.nextBtn} onClick={() => setScreen('intro2')}>ДАЛЕЕ →</button>
            </div>
          )}
          {screen === 'intro2' && (
            <div className={styles.introScreen}>
              <h2 className={styles.introTitle}>КОНСТРУКТОР</h2>
              <p className={styles.introText}>Собери спутники из пазлов!</p>
              <button className={styles.nextBtn} onClick={() => setScreen('intro3')}>ДАЛЕЕ →</button>
            </div>
          )}
          {screen === 'intro3' && (
            <div className={styles.introScreen}>
              <h2 className={styles.introTitle}>ЗАДАНИЕ</h2>
              <p className={styles.introText}>Собери {PUZZLE_SETS.length} пазла за 5 минут!</p>
              <button className={styles.startMissionBtn} onClick={startGame}>НАЧАТЬ МИССИЮ</button>
            </div>
          )}

          {screen === 'game' && (
            <>
              <div className={styles.hud}>
                <div className={styles.hudItem}><span className={styles.hudLabel}>Пазл</span><span className={styles.hudValue}>{currentPuzzle + 1}/{PUZZLE_SETS.length}</span></div>
                <div className={styles.hudItem}><span className={styles.hudLabel}>Время</span><span className={`${styles.hudTimer} ${timeLeft < 60 ? styles.danger : ''}`}>{formatTime(timeLeft)}</span></div>
              </div>
              <div className={styles.puzzleArea}>
                {pieces.filter(p => !p.placed).map(p => <div key={`t-${p.id}`} className={styles.targetSpot} style={{ left: p.targetX, top: p.targetY, width: puzzle.pieceWidth, height: puzzle.pieceHeight }} />)}
                {pieces.filter(p => p.placed).map(p => <div key={`pl-${p.id}`} className={`${styles.piece} ${styles.placed}`} style={{ left: p.targetX, top: p.targetY, ...getPieceStyle(p) }} />)}
                {pieces.filter(p => !p.placed).map(p => <div key={p.id} className={`${styles.piece} ${dragging === p.id ? styles.dragging : ''}`} style={{ left: p.x, top: p.y, ...getPieceStyle(p) }} onMouseDown={e => handleMouseDown(e, p.id)} />)}
              </div>
            </>
          )}

          {screen === 'complete' && (
            <div className={styles.completeScreen}>
              <div className={`${styles.completeImage} ${showGlow ? styles.glow : ''}`}><img src={puzzle.image} alt={puzzle.name} className={styles.fullImage} /></div>
              <div className={styles.completeInfo}>
                <h3 className={styles.completeTitle}>{puzzle.name}</h3>
                <p className={styles.completeText}>{puzzle.info}</p>
                <button className={styles.nextBtn} onClick={nextPuzzle}>{currentPuzzle < PUZZLE_SETS.length - 1 ? 'СЛЕДУЮЩИЙ ПАЗЛ →' : 'ЗАВЕРШИТЬ'}</button>
              </div>
            </div>
          )}

          {gameOver && screen !== 'complete' && (
            <div className={styles.gameOverlay}><h2>{gameWon ? 'ВСЕ СПУТНИКИ СОБРАНЫ!' : 'ВРЕМЯ ВЫШЛО'}</h2><button onClick={startGame}>ЗАНОВО</button></div>
          )}
        </div>
      </div>
    </div>
  );
};