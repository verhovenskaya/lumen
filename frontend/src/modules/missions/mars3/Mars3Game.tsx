import React, { useEffect, useState } from 'react';

import { NOVEL_TEXT, EDUCATIONAL_FACTS, MARS_PARAMS } from './config';
import { useMars3Game } from './hooks/useMars3Game';

import styles from './Mars3Game.module.scss';

import marsTexture from '../../../../public/assets/textures/8k_mars.jpg';
import landerImage from '../../../../public/assets/textures/8k_mars.jpg';

interface Props {
  onClose: () => void;
  onWin?: () => void;
}

export const Mars3Game: React.FC<Props> = ({
  onClose,
  onWin,
}) => {
  const [showFact, setShowFact] = useState(false);
  const [currentFact, setCurrentFact] = useState(0);

  const {
    screen,
    novelStep,
    setNovelStep,

    startGame,
    moveCursor,
    scan,

    cursor,
    scanVisible,

    gameWon,
    gameOver,

    timeLeft,
    attempts,
    hint,
    signalStrength,
  } = useMars3Game(onWin);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleScanWithEducation = () => {
    if (gameWon || gameOver) return; // Не сканируем если игра уже закончена
    
    scan();
    
    // Показываем случайный образовательный факт при каждом сканировании
    const randomFact = Math.floor(Math.random() * EDUCATIONAL_FACTS.length);
    setCurrentFact(randomFact);
    setShowFact(true);
    setTimeout(() => setShowFact(false), 3000);
  };

  const handleMissionComplete = () => {
    onWin?.();
    onClose();
  };

  // Для отладки - выводим в консоль состояние победы
  useEffect(() => {
    console.log('gameWon changed:', gameWon);
    console.log('gameOver changed:', gameOver);
  }, [gameWon, gameOver]);

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>

        <div className={styles.titleBar}>
          <div className={styles.title}>🇷🇺 Марс-3: Поиск места посадки</div>
          <button onClick={onClose} className={styles.closeBtn}>✕</button>
        </div>

        {/* NOVEL */}
        {(screen === 'novel1' || screen === 'novel2' || screen === 'novel3') && (
          <div className={styles.novel}>
            <p className={styles.novelText}>{NOVEL_TEXT[novelStep]}</p>
            <button
              className={styles.novelBtn}
              onClick={() => novelStep < 2 ? setNovelStep((p) => p + 1) : startGame()}
            >
              {novelStep < 2 ? 'ПРОДОЛЖИТЬ' : 'К БРИФИНГУ'}
            </button>
          </div>
        )}

        {/* BRIEFING */}
        {screen === 'briefing' && (
          <div className={styles.briefing}>
            <h1 className={styles.briefingTitle}>ЗАДАНИЕ</h1>
            <p className={styles.briefingText}>
              Используя орбитальные данные и телеметрию,
              найдите место посадки станции «Марс-3».
            </p>
            
            <div className={styles.eduBriefing}>
              <h3>📚 УСЛОВИЯ ПОИСКА НА МАРСЕ</h3>
              <div className={styles.paramsGrid}>
                {MARS_PARAMS.map((param, idx) => (
                  <div key={idx} className={styles.paramCard}>
                    <span className={styles.paramIcon}>{param.icon}</span>
                    <div>
                      <div className={styles.paramName}>{param.name}</div>
                      <div className={styles.paramValue}>{param.value}</div>
                      <div className={styles.paramDesc}>{param.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className={styles.startBtn} onClick={startGame}>
              НАЧАТЬ МИССИЮ
            </button>
          </div>
        )}

        {/* GAME - показываем игру только если нет победы */}
        {screen === 'game' && !gameWon && (
          <div className={styles.game}>
            <div className={styles.terminal}>

              <div className={styles.sidebar}>
                <div className={styles.telemetryBlock}>
                  <div className={styles.telemetryTitle}>⏱ ВРЕМЯ</div>
                  <div className={styles.telemetryValue}>{formatTime(timeLeft)}</div>
                  <div className={styles.telemetryWarning}>
                    {timeLeft < 60 && timeLeft > 30 && '⚠️ Лимит приближается'}
                    {timeLeft <= 30 && '🔴 КРИТИЧЕСКИЙ ЛИМИТ'}
                  </div>
                </div>

                <div className={styles.telemetryBlock}>
                  <div className={styles.telemetryTitle}>🔍 СКАНОВ</div>
                  <div className={styles.telemetryValue}>{attempts}</div>
                  <div className={styles.telemetryWarning}>
                    {attempts >= 10 && attempts < 15 && '⚠️ Расход энергии повышен'}
                    {attempts >= 15 && '🔴 Ограничение ресурсов'}
                  </div>
                </div>

                <div className={styles.telemetryBlock}>
                  <div className={styles.telemetryTitle}>📡 СИГНАЛ</div>
                  <div className={styles.telemetryValue}>
                    {Math.round(signalStrength)}%
                  </div>
                  <div className={styles.signalBar}>
                    <div 
                      className={styles.signalFill} 
                      style={{ width: `${signalStrength}%` }}
                    />
                  </div>
                </div>

                <div className={styles.telemetryBlock}>
                  <div className={styles.telemetryTitle}>🪨 СТАТУС</div>
                  <div className={styles.statusText}>{hint}</div>
                </div>

                <div className={styles.gameEduBlock}>
                  <div className={styles.eduMiniTitle}>📖 ЗНАНИЕ МАРСА</div>
                  <div className={styles.eduMiniText}>
                    {EDUCATIONAL_FACTS[Math.min(currentFact, EDUCATIONAL_FACTS.length - 1)]}
                  </div>
                </div>
              </div>

              <div className={styles.mapArea}>
                <div
                  className={styles.marsMap}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    moveCursor(
                      ((e.clientX - rect.left) / rect.width) * 100,
                      ((e.clientY - rect.top) / rect.height) * 100,
                    );
                  }}
                  onClick={handleScanWithEducation}
                >
                  <div 
                    className={styles.marsTexture}
                    style={{ backgroundImage: `url(${marsTexture})` }}
                  />

                  <div className={styles.heatmap}>
                    {Array.from({ length: 30 }).map((_, i) =>
                      Array.from({ length: 30 }).map((_, j) => {
                        const x = (i / 29) * 100;
                        const y = (j / 29) * 100;
                        const dx = x - cursor.x;
                        const dy = y - cursor.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const signal = Math.exp(-dist / 18);
                        const alpha = Math.min(signal * 1.6, 1);
                        return (
                          <div
                            key={`${i}-${j}`}
                            style={{
                              position: 'absolute',
                              left: `${x}%`,
                              top: `${y}%`,
                              width: '4%',
                              height: '4%',
                              transform: 'translate(-50%, -50%)',
                              borderRadius: '50%',
                              background: `rgba(196,181,253,${alpha})`,
                              filter: `blur(${6 * alpha}px)`,
                              pointerEvents: 'none',
                            }}
                          />
                        );
                      }),
                    )}
                  </div>

                  <div className={styles.gridOverlay} />

                  <div
                    className={styles.cursor}
                    style={{
                      left: `${cursor.x}%`,
                      top: `${cursor.y}%`,
                    }}
                  >
                    <div className={styles.cursorDot} />
                    <div className={styles.cursorCrossH} />
                    <div className={styles.cursorCrossV} />
                  </div>

                  {scanVisible && (
                    <div
                      className={styles.scanPulse}
                      style={{
                        left: `${cursor.x}%`,
                        top: `${cursor.y}%`,
                      }}
                    />
                  )}

                  {showFact && !gameWon && (
                    <div className={styles.eduToast}>
                      <div className={styles.eduToastContent}>
                        <span className={styles.eduToastIcon}>📘</span>
                        <span className={styles.eduToastText}>{EDUCATIONAL_FACTS[currentFact]}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.logPanel}>
              <span className={styles.logIcon}>🛸</span> {hint}
            </div>

            {/* LOSE */}
            {gameOver && !gameWon && (
              <div className={styles.gameOverlay}>
                <div className={styles.loseContainer}>
                  <h2 className={styles.loseTitle}>⏰ ВРЕМЯ ВЫШЛО</h2>
                  <p className={styles.loseText}>Сигнал потерян в марсианской пылевой буре.</p>
                  <div className={styles.loseEdu}>
                    <p>💡 Интересный факт: Пылевые бури на Марсе могут длиться неделями и покрывать всю планету!</p>
                  </div>
                  <button className={styles.retryBtn} onClick={startGame}>
                    ПОПРОБОВАТЬ СНОВА
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ЭКРАН ПОБЕДЫ - отдельно, вне условия game */}
        {screen === 'game' && gameWon && (
          <div className={styles.gameOverlay}>
            <div className={styles.archiveScreen}>
              <div className={styles.victoryCard}>
                <div className={styles.victoryHeader}>
                  <span className={styles.victoryIcon}>🏆</span>
                  <h1 className={styles.victoryTitle}>МИССИЯ УСПЕШНА!</h1>
                  <span className={styles.victoryIcon}>🏆</span>
                </div>
                
                <div className={styles.victoryContent}>
                  <div className={styles.victoryInfo}>
                    <h2 className={styles.victorySubtitle}>📍 МАРС-3 ОБНАРУЖЕН</h2>
                    <p className={styles.victoryText}>
                      Поздравляем! Вы успешно обнаружили место посадки легендарной советской станции «Марс-3», 
                      которая совершила первую в истории мягкую посадку на поверхность Марса 2 декабря 1971 года.
                    </p>
                    <div className={styles.victoryStats}>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>🔍 Сканов затрачено:</span>
                        <span className={styles.statValue}>{attempts}</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>⏱ Время миссии:</span>
                        <span className={styles.statValue}>{formatTime(180 - timeLeft)}</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>📡 Точность обнаружения:</span>
                        <span className={styles.statValue}>{Math.round(signalStrength)}%</span>
                      </div>
                    </div>

                    <div className={styles.eduSummary}>
                      <h4>📊 АНАЛИЗ РАЙОНА ПОСАДКИ</h4>
                      <p>• Толщина реголита: 2-5 метров</p>
                      <p>• Уровень радиации: 0.24 Гр/год</p>
                      <p>• Температура в районе: -65°C</p>
                      <p>• Давление: ~600 Па</p>
                    </div>
                  </div>

                  <div className={styles.futureMission}>
                    <div className={styles.futureBadge}>🚀 БУДУЩАЯ МИССИЯ</div>
                    <div className={styles.landerImage}>
                      <img src={landerImage} alt="Mars Lander" />
                    </div>
                    <h3 className={styles.landerTitle}>ПОСАДОЧНЫЙ МОДУЛЬ «ФЕНИКС-М»</h3>
                    <p className={styles.landerDescription}>
                      На основе данных о рельефе и составе грунта в районе посадки «Марс-3» 
                      разработан новый посадочный модуль. Ваше открытие поможет выбрать 
                      идеальное место для следующей миссии!
                    </p>
                    <div className={styles.landerSpecs}>
                      <span className={styles.spec}>🔬 5 научных инструментов</span>
                      <span className={styles.spec}>📡 Связь через орбитальный ретранслятор</span>
                      <span className={styles.spec}>⚡ Термоэлектрический генератор</span>
                      <span className={styles.spec}>🪨 Бур для реголита (2 метра)</span>
                    </div>
                  </div>
                </div>

                <div className={styles.victoryFooter}>
                  <button className={styles.victoryBtn} onClick={handleMissionComplete}>
                    ✨ ЗАВЕРШИТЬ МИССИЮ ✨
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};