import React, { useState, useEffect } from 'react';
import { type MissionUI } from '../../service/mission.service';
import styles from './MissionPanel.module.scss';
import { RoverGame } from '../../games/RoverGame/RoverGame';
import { PuzzleGame } from '../../games/PuzzleGames/PuzzleGame';
import { AnomalyGame } from '../../games/AnomalyGame/AnomalyGame';
import { VoyagerGame } from '../../games/voyager/VoyagerGame';
import { PlanetaryWeatherCenter } from '../../games/PlanetaryWeatherCenter/components/PlanetaryWeatherCenter';
import { missionService } from '../../service/mission.service';

interface MissionPanelProps {
  missions: MissionUI[];
  isOpen: boolean;
  onClose: () => void;
  onCompleteMission: (missionId: string) => void;
  onRefreshMissions?: () => void;  
}

export const MissionPanel: React.FC<MissionPanelProps> = ({ 
  missions, 
  isOpen, 
  onClose, 
  onCompleteMission,
  onRefreshMissions  
}) => {
  const [position, setPosition] = useState({ x: window.innerWidth - 340, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [activeGame, setActiveGame] = useState<string | null>(null);

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

  const handleGameWin = async (missionId: string, gameType: string) => {
    console.log('Game won! Mission:', missionId, 'Game type:', gameType);
    
    const mission = missions.find(m => m.game === gameType);
    
    if (mission && !mission.completed) {
      try {
        await missionService.updateProgress(parseInt(mission.id), mission.maxProgress);
        console.log('Mission progress updated!');
        
        if (onRefreshMissions) {
          await onRefreshMissions();
        }
        
        onCompleteMission(mission.id);
      } catch (error) {
        console.error('Failed to update mission progress:', error);
      }
    }
    
    setActiveGame(null);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Рендер игр */}
      {activeGame === 'rover' && (
        <RoverGame onClose={() => setActiveGame(null)} onWin={() => handleGameWin('rover_mission', 'rover')} />
      )}
      {activeGame === 'puzzle' && (
        <PuzzleGame 
          onClose={() => setActiveGame(null)} 
          onWin={() => handleGameWin('puzzle_mission', 'puzzle')} 
        />
      )}
      {activeGame === 'anomaly' && (
        <AnomalyGame onClose={() => setActiveGame(null)} onWin={() => handleGameWin('anomaly_mission', 'anomaly')} />
      )}
      {activeGame === 'voyager' && (
        <VoyagerGame onClose={() => setActiveGame(null)} onWin={() => handleGameWin('voyager_mission', 'voyager')} />
      )}
      {activeGame === 'weather' && (
        <PlanetaryWeatherCenter onClose={() => setActiveGame(null)} />
      )}

      {/* Панель миссий */}
      <div className={styles.panel} style={{ left: position.x, top: position.y }}>
        <div className={styles.header} onMouseDown={handleMouseDown}>
          <h3 className={styles.title}>МИССИИ</h3>
          <div className={styles.headerButtons}>
            <button className={styles.closeButton} onClick={onClose}>✕</button>
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
              
              <div className={styles.missionRow}>
                <div className={styles.missionProgress}>
                  <div className={styles.progressBar}>
                    <div 
                      className={`${styles.progressFill} ${mission.completed ? styles.completedFill : ''}`} 
                      style={{ width: `${(mission.progress / mission.maxProgress) * 100}%` }} 
                    />
                  </div>
                  <span className={styles.progressText}>{mission.progress}/{mission.maxProgress}</span>
                </div>

                {mission.game && !mission.completed && (
                  <button 
                    className={styles.playButton}
                    onClick={() => setActiveGame(mission.game!)}
                    title="Запустить миссию"
                  >
                    ▶
                  </button>
                )}
              </div>

              {mission.completed && <p className={styles.reward}>{mission.reward}</p>}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};