import React from 'react';
import { useVoyagerGame } from './hooks/useVoyagerGame';
import styles from './VoyagerGame.module.scss';

interface Props {
  onClose: () => void;
  onWin?: () => void;
}

const NOVEL_TEXT = [
  '1977 год. NASA запускает аппарат Voyager-1. Его миссия — исследовать внешние планеты Солнечной системы.',
  'Спустя десятилетия зонд покинул границы гелиосферы и стал самым удалённым объектом, созданным человечеством.',
  'Сегодня Deep Space Network получила крайне слабый сигнал. Возможно, это последнее сообщение Voyager-1.',
];

export const VoyagerGame: React.FC<Props> = ({ onClose, onWin }) => {
  const {
    screen,
    novelStep,
    antennaElRef,
    signalElRef,
    fakeSignalElRef,
    fakeSignal,
    packets,
    totalPackets,
    signalStrength,
    timeLeft,
    gameOver,
    gameWon,
    showTutorial,
    isInterference,
    isDisconnected,
    showDisconnectWarning,
    spectrum,
    telemetryLog,
    decodedMessages,
    showDecoding,
    decodingProgress,
    currentStage,
    stageWarning,
    nextNovel,
    goToBriefing,
    startGame,
  } = useVoyagerGame(onWin);

  const [isMaximized, setIsMaximized] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const windowRef = React.useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getSignalBarWidth = () => Math.min(100, Math.max(0, signalStrength));

  const getStageName = (stage: number) => {
    const names = ['', 'STAGE 1', 'STAGE 2', 'STAGE 3'];
    return names[stage] || 'STAGE 4';
  };

  const getStageColor = (stage: number) => {
    const colors = ['#00ff88', '#ffaa00', '#ff6600', '#ff0000'];
    return colors[stage] || '#ff0000';
  };

  const center = 210;

  const handleTitleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  React.useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e: MouseEvent) => setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    const handleUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); };
  }, [isDragging, dragStart]);

  return (
    <div className={`${styles.overlay} ${isMaximized ? styles.maximized : ''}`}>
      <div
        ref={windowRef}
        className={`${styles.container} ${isMaximized ? styles.fullscreen : ''}`}
        style={!isMaximized ? { left: position.x || 'auto', top: position.y || 'auto', transform: 'none' } : {}}
      >
        <div className={styles.titleBar} onMouseDown={handleTitleMouseDown}>
          <div className={styles.titleLeft}>
            <span className={styles.titleText}>Deep Space Network{screen === 'game' ? ' — Voyager-1' : ''}</span>
          </div>
          <div className={styles.titleButtons}>
            <button className={styles.titleBtn} onClick={() => setIsMaximized(!isMaximized)}>
              {isMaximized ? '❐' : '□'}
            </button>
            <button className={`${styles.titleBtn} ${styles.closeWinBtn}`} onClick={onClose}>✕</button>
          </div>
        </div>

        <div className={styles.windowBody}>
          {/* NOVEL */}
          {(screen === 'novel1' || screen === 'novel2' || screen === 'novel3') && (
            <div className={styles.introScreen}>
              <div className={styles.stars} />
              <h2 className={styles.introTitle}>
                {novelStep === 0 ? 'VOYAGER-1' : novelStep === 1 ? 'МЕЖЗВЁЗДНОЕ ПРОСТРАНСТВО' : 'ПОСЛЕДНИЙ СИГНАЛ'}
              </h2>
              <p className={styles.introText}>{NOVEL_TEXT[novelStep]}</p>
              <button className={styles.nextBtn} onClick={() => novelStep < 2 ? nextNovel() : goToBriefing()}>
                {novelStep < 2 ? 'ДАЛЕЕ' : 'К БРИФИНГУ'}
              </button>
            </div>
          )}

          {screen === 'briefing' && (
            <div className={styles.introScreen}>
              <h2 className={styles.introTitle}>ЗАДАНИЕ</h2>
              <p className={styles.introText}>
                Настройте антенну дальней космической связи и получите последние данные, передаваемые Voyager-1.
              </p>
              <div className={styles.objectiveList}>
                <div className={styles.objectiveItem}>Восстановить 100 пакетов данных</div>
                <div className={styles.objectiveItem}>Время: 3 минуты</div>
                <div className={styles.objectiveItem}>Удерживайте антенну на сигнале</div>
                <div className={styles.objectiveItem}>Остерегайтесь помех и ложных сигналов</div>
                <div className={styles.objectiveItem}>Используйте WASD или стрелки для управления</div>
              </div>
              <button className={styles.startMissionBtn} onClick={startGame}>НАЧАТЬ МИССИЮ</button>
            </div>
          )}

          {screen === 'game' && (
            <div className={styles.gameScreen}>
              {stageWarning && (
                <div className={styles.stageWarning}>
                  {stageWarning}
                </div>
              )}

              <div className={styles.hud}>
                <div className={styles.hudItem}>
                  <span className={styles.hudLabel}>Пакеты</span>
                  <span className={styles.hudValue}>{Math.floor(packets)}/{totalPackets}</span>
                </div>
                <div className={styles.hudItem}>
                  <span className={styles.hudLabel}>Сигнал</span>
                  <div className={styles.signalBarSmall}>
                    <div
                      className={styles.signalFillSmall}
                      style={{
                        width: `${getSignalBarWidth()}%`,
                        backgroundColor: signalStrength < 30 ? '#ff4444' : signalStrength < 60 ? '#ffaa00' : '#00ff88'
                      }}
                    />
                  </div>
                  <span className={styles.hudValue}>{Math.floor(signalStrength)}%</span>
                </div>
                <div className={styles.hudItem}>
                  <span className={styles.hudLabel}>Время</span>
                  <span className={`${styles.hudTimer} ${timeLeft < 60 ? styles.danger : ''}`}>{formatTime(timeLeft)}</span>
                </div>
                <div className={styles.hudItem}>
                  <span className={styles.hudLabel}>Этап</span>
                  <span className={styles.hudValue} style={{ color: getStageColor(currentStage) }}>
                    {getStageName(currentStage)}
                  </span>
                </div>
              </div>

              <div className={styles.gameGrid}>
                <div className={`${styles.radarContainer} ${isInterference ? styles.interference : ''} ${isDisconnected ? styles.disconnected : ''}`}>
                  <div className={styles.radar}>
                    <div className={styles.radarGrid} />
                    <div className={styles.center} />

                    {fakeSignal.active && (
                      <div
                        ref={fakeSignalElRef}
                        className={styles.fakeSignal}
                        style={{
                          position: 'absolute',
                          left: `${center}px`,
                          top: `${center}px`,
                        }}
                      />
                    )}

                    <div
                      ref={signalElRef}
                      className={styles.signal}
                      style={{
                        position: 'absolute',
                        left: `${center + 15 * 4}px`,
                        top: `${center + (-10) * 4}px`,
                      }}
                    />

                    <div
                      ref={antennaElRef}
                      className={styles.antenna}
                      style={{
                        position: 'absolute',
                        left: `${center}px`,
                        top: `${center}px`,
                      }}
                    />
                  </div>

                  <div className={`${styles.staticOverlay} ${isDisconnected ? styles.active : ''}`}>
                    <div className={styles.staticNoise} />
                    <div className={styles.glitchLines} />
                    <div className={`${styles.glitchBlock} ${styles.glitchBlock1}`} />
                    <div className={`${styles.glitchBlock} ${styles.glitchBlock2}`} />
                    <div className={`${styles.glitchBlock} ${styles.glitchBlock3}`} />
                  </div>

                  <div className={`${styles.disconnectWarning} ${showDisconnectWarning ? styles.active : ''}`}>
                    РАЗРЫВ СВЯЗИ
                  </div>
                </div>

                <div className={styles.telemetryPanel}>
                  <div className={styles.panelHeader}>Телеметрия DSN</div>
                  <div className={styles.telemetryContent}>
                    {telemetryLog.slice(0, 8).map((entry, idx) => (
                      <div key={idx} className={`${styles.telemetryLine} ${styles[entry.type]}`}>
                        <span className={styles.telemetryTime}>[{entry.timestamp}]</span>
                        <span>{entry.message}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.spectrumPanel}>
                  <div className={styles.panelHeader}>Спектрограмма</div>
                  <div className={styles.spectrumDisplay}>
                    <code className={styles.spectrumBars}>{spectrum}</code>
                  </div>
                </div>

                <div className={styles.dataPanel}>
                  <div className={styles.panelHeader}>Расшифрованные данные</div>
                  <div className={styles.dataContent}>
                    {decodedMessages.length > 0 ? (
                      decodedMessages.slice(-5).map((msg) => (
                        <div key={msg.id} className={styles.dataLine}>
                          {msg.content}
                        </div>
                      ))
                    ) : (
                      <div className={styles.dataEmpty}>Ожидание данных...</div>
                    )}
                  </div>
                </div>
              </div>

              {showTutorial && !gameOver && !gameWon && (
                <div className={styles.tutorial}>
                  Используйте WASD или стрелки для перемещения антенны
                </div>
              )}

              {showDecoding && !gameWon && (
                <div className={styles.decodingOverlay}>
                  <div className={styles.decodingBox}>
                    <h3>РАСШИФРОВКА ДАННЫХ VOYAGER-1</h3>
                    <div className={styles.decodingProgress}>
                      <div className={styles.decodingFill} style={{ width: `${decodingProgress}%` }} />
                    </div>
                    <div className={styles.decodingMessages}>
                      {decodedMessages.map((msg, idx) => (
                        <div key={idx} className={styles.decodingLine}>{msg.content}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {(gameOver || gameWon) && !showDecoding && (
                <div className={styles.gameOverlay}>
                  <h2>{gameWon ? 'МИССИЯ ВЫПОЛНЕНА' : 'СВЯЗЬ ПОТЕРЯНА'}</h2>
                  <p>
                    {gameWon
                      ? 'Данные Voyager-1 успешно получены. Послание из межзвёздного пространства сохранено.'
                      : 'Сигнал исчез в межзвёздном пространстве. Попробуйте снова.'}
                  </p>
                  <button onClick={startGame}>
                    {gameWon ? 'ИГРАТЬ СНОВА' : 'ПОПРОБОВАТЬ СНОВА'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};