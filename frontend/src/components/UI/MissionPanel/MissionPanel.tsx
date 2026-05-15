import React, { useState, useEffect } from 'react';
import { type Mission } from '../../../hooks/useMissions';
import styles from './MissionPanel.module.scss';
import { RoverGame } from '../../RoverGame/RoverGame';
import { PuzzleGame } from '../../PuzzleGame/PuzzleGame';
import { AnomalyGame } from '../../AnomalyGame/AnomalyGame';

interface MissionPanelProps {
  missions: Mission[];
  viewedCount: number;
  onClose: () => void;
  onCompleteMission: (missionId: string) => void;
}

export const MissionPanel: React.FC<MissionPanelProps> = ({ 
  missions, viewedCount, onClose, onCompleteMission 
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 340, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [activeGame, setActiveGame] = useState<string | null>(null);

  const completedCount = missions.filter(m => m.completed).length;

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: Math.max(0, Math.min(window.innerWidth - 320, e.clientX - dragOffset.x)),
          y: Math.max(0, Math.min(window.innerHeight - 300, e.clientY - dragOffset.y)),
        });
      }
    };
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleGameWin = (missionId: string) => {
    onCompleteMission(missionId);
    setActiveGame(null);
  };

  if (isMinimized) {
    return (
      <div className={styles.floatingButton} onClick={() => setIsMinimized(false)}>
        <span className={styles.floatingIcon}>⚡</span>
        {completedCount > 0 && (
          <span className={styles.floatingBadge}>{completedCount}/{missions.length}</span>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Игры */}
      {activeGame === 'rover' && (
        <RoverGame onClose={() => setActiveGame(null)} onWin={() => handleGameWin('rover_mission')} />
      )}
      {activeGame === 'puzzle' && (
        <PuzzleGame onClose={() => setActiveGame(null)} onWin={() => handleGameWin('puzzle_mission')} />
      )}
      {activeGame === 'anomaly' && (
        <AnomalyGame onClose={() => setActiveGame(null)} onWin={() => handleGameWin('anomaly_mission')} />
      )}

      <div className={styles.panel} style={{ left: position.x, top: position.y }}>
        <div className={styles.header} onMouseDown={handleMouseDown}>
          <h3 className={styles.title}>МИССИИ</h3>
          <div className={styles.headerButtons}>
            <button className={styles.minimizeButton} onClick={() => setIsMinimized(true)}>—</button>
            <button className={styles.closeButton} onClick={onClose}>✕</button>
          </div>
        </div>

        <div className={styles.overallProgress}>
          <span className={styles.progressLabel}>Планет изучено</span>
          <span className={styles.progressCount}>{viewedCount}/10</span>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${(viewedCount / 10) * 100}%` }} />
          </div>
        </div>

        <div className={styles.missionList}>
          {missions.map(mission => (
            <div key={mission.id} className={`${styles.mission} ${mission.completed ? styles.completed : ''}`}>
              <div className={styles.missionHeader}>
                <span className={`${styles.missionCheck} ${mission.completed ? styles.checked : ''}`}>
                  {mission.completed ? '✓' : ''}
                </span>
                <span className={styles.missionTitle}>{mission.title}</span>
              </div>
              <p className={styles.missionDesc}>{mission.description}</p>
              <div className={styles.missionProgress}>
                <div className={styles.progressBar}>
                  <div 
                    className={`${styles.progressFill} ${mission.completed ? styles.completedFill : ''}`} 
                    style={{ width: `${(mission.progress / mission.maxProgress) * 100}%` }} 
                  />
                </div>
                <span className={styles.progressText}>{mission.progress}/{mission.maxProgress}</span>
              </div>
              {mission.completed && <p className={styles.reward}>{mission.reward}</p>}
              
              {mission.game && !mission.completed && (
                <button 
                  className={styles.playButton}
                  onClick={() => setActiveGame(mission.game!)}
                >
                  ▶ ЗАПУСТИТЬ
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};