import { missionService } from '../../../service/mission.service';

export interface PuzzleProgress {
  satelliteId: string;
  level: string;
  stars: number;
  bestTime: number | null;
  completed: boolean;
}

class PuzzleService {
  private missionId = 2; 

  async savePuzzleProgress(
    satelliteId: string,
    level: string,
    stars: number,
    timeInSeconds: number
  ): Promise<{ currentLevel: number; completedSatellites: string[] }> {
    try {
      console.log('=== savePuzzleProgress ===', { satelliteId, level, stars, timeInSeconds });
      
      const progress = await missionService.getMissionProgress(this.missionId);
      
      let puzzleData: Record<string, any> = {};
      if (progress?.additional_data) {
        try {
          puzzleData = typeof progress.additional_data === 'string' 
            ? JSON.parse(progress.additional_data) 
            : progress.additional_data;
        } catch {
          puzzleData = {};
        }
      }
      
      if (!puzzleData[satelliteId]) {
        puzzleData[satelliteId] = {};
      }
      
      puzzleData[satelliteId]['ЛЁГКИЙ'] = {
        stars: Math.max(stars, puzzleData[satelliteId]['ЛЁГКИЙ']?.stars || 0),
        bestTime: puzzleData[satelliteId]['ЛЁГКИЙ']?.bestTime 
          ? Math.min(timeInSeconds, puzzleData[satelliteId]['ЛЁГКИЙ'].bestTime) 
          : timeInSeconds,
        completed: true,
        lastPlayed: new Date().toISOString(),
      };
      
      puzzleData[satelliteId]['completed'] = true;
      
      const completedSatellites = Object.keys(puzzleData).filter(
        satId => puzzleData[satId]['completed'] === true
      );
      
      const currentLevel = Math.min(completedSatellites.length, 3);
      
      console.log('Progress calculation:', { 
        completedSatellites, 
        count: completedSatellites.length,
        currentLevel,
        maxLevel: 3
      });
      
      await missionService.updateProgress(
        this.missionId,
        currentLevel,
        puzzleData
      );
      
      console.log('Puzzle progress saved! Current level:', currentLevel);
      
      return { currentLevel, completedSatellites };
    } catch (error) {
      console.error('Error saving puzzle progress:', error);
      throw error;
    }
  }

  async loadPuzzleProgress(): Promise<Record<string, any>> {
    try {
      const progress = await missionService.getMissionProgress(this.missionId);
      
      if (progress?.additional_data) {
        const data = typeof progress.additional_data === 'string'
          ? JSON.parse(progress.additional_data)
          : progress.additional_data;
        console.log('Loaded puzzle progress:', data);
        return data;
      }
      
      return {};
    } catch (error) {
      console.error('Error loading puzzle progress:', error);
      return {};
    }
  }

  async getPuzzleLevelProgress(
    satelliteId: string,
    level: string
  ): Promise<{ stars: number; bestTime: number | null; completed: boolean }> {
    const allProgress = await this.loadPuzzleProgress();
    return allProgress[satelliteId]?.[level] || { stars: 0, bestTime: null, completed: false };
  }
  
  async getCompletedSatellitesCount(): Promise<number> {
    const progress = await this.loadPuzzleProgress();
    const completed = Object.keys(progress).filter(
      satId => progress[satId]['completed'] === true
    );
    return completed.length;
  }
}

export const puzzleService = new PuzzleService();