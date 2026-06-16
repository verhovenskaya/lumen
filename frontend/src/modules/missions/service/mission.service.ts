import { apiClient } from '../../../shared/api/api.client';

export interface Mission {
  id: number;
  name: string;
  description: string;
  max_level: number;
}

export interface MissionUI {
  id: string;
  title: string;
  description: string;
  maxProgress: number;
  progress: number;
  completed: boolean;
  reward: string;
  game?: string;
}

export interface MissionWithProgress extends Mission {
  current_level: number;
  completed: boolean;
  additional_data?: any;
}

export interface UserProgress {
  id: number;
  mission_id: number;
  mission_name: string;
  max_level: number;
  current_level: number;
  completed: boolean;
  additional_data: any;
  updated_at: string;
}

const missionMapping: Record<string, { title: string; game: string; reward: string }> = {
  'rover': {
    title: 'Марсоход Perseverance',
    game: 'rover',
    reward: '+500 XP'
  },
  'puzzle': {
    title: 'Спутниковый конструктор',
    game: 'puzzle',
    reward: '+300 XP'
  },
  'planet_order': {
    title: 'Порядок планет',
    game: 'planetGame',  
    reward: '+200 XP'
  },
  'anomaly': {          
    title: 'Космические аномалии',
    game: 'anomaly',
    reward: '+400 XP'
  },
  'voyager': {           
    title: 'Вояджер: Путь к звёздам',
    game: 'voyager',
    reward: '+350 XP'
  },
  'weather': {           
    title: 'Планетарная погода',
    game: 'weather',
    reward: '+250 XP'
  }
};

class MissionService {
  private getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  async getMissions(): Promise<Mission[]> {
    const response = await apiClient.get<{ success: boolean; data: Mission[] }>('/missions');
    return response.data;
  }

  async getMission(missionId: number): Promise<Mission> {
    const response = await apiClient.get<{ success: boolean; data: Mission }>(`/missions/${missionId}`);
    return response.data;
  }

  async getUserProgress(): Promise<UserProgress[]> {
    const token = this.getToken();
    if (!token) {
      return [];
    }
    
    try {
      const response = await apiClient.get<{ success: boolean; data: UserProgress[] }>('/progress', token);
      return response.data || [];
    } catch (error) {
      console.warn('Failed to fetch user progress:', error);
      return [];
    }
  }

  async getMissionProgress(missionId: number): Promise<UserProgress | null> {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    
    try {
      const response = await apiClient.get<{ success: boolean; data: UserProgress | null }>(`/progress/${missionId}`, token);
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch mission progress:', error);
      return null;
    }
  }

  async updateProgress(missionId: number, currentLevel: number, additionalData?: any): Promise<UserProgress> {
    const token = this.getToken();
    if (!token) throw new Error('No token found');
    
    const response = await apiClient.post<{ success: boolean; data: UserProgress }>(
      `/progress/${missionId}/update`,
      { currentLevel, additionalData },
      token
    );
    return response.data;
  }

  async initializeProgress(missionId: number): Promise<UserProgress> {
    const token = this.getToken();
    if (!token) throw new Error('No token found');
    
    const response = await apiClient.post<{ success: boolean; data: UserProgress }>(
      '/progress/initialize',
      { missionId },
      token
    );
    return response.data;
  }

  async getMissionsWithProgress(): Promise<MissionWithProgress[]> {
    const missions = await this.getMissions();
    
    let userProgress: UserProgress[] = [];
    try {
      userProgress = await this.getUserProgress();
    } catch (error) {
      console.warn('Could not fetch user progress');
    }

    const progressMap = new Map<number, UserProgress>();
    userProgress.forEach(progress => {
      if (progress && progress.mission_id) {
        progressMap.set(progress.mission_id, progress);
      }
    });

    return missions.map(mission => ({
      ...mission,
      current_level: progressMap.get(mission.id)?.current_level || 0,
      completed: progressMap.get(mission.id)?.completed || false,
      additional_data: progressMap.get(mission.id)?.additional_data,
    }));
  }

  async getMissionsUI(): Promise<MissionUI[]> {
    const missionsWithProgress = await this.getMissionsWithProgress();
    
    return missionsWithProgress.map(mission => {
      const mapping = missionMapping[mission.name];
      
      // Если миссия не найдена в маппинге, создаем дефолтную
      if (!mapping) {
        return {
          id: mission.id.toString(),
          title: mission.name,
          description: mission.description,
          maxProgress: mission.max_level,
          progress: mission.current_level,
          completed: mission.completed,
          reward: '+100 XP',
          game: undefined,
        };
      }
      
      return {
        id: mission.id.toString(),
        title: mapping.title,
        description: mission.description,
        maxProgress: mission.max_level,
        progress: mission.current_level,
        completed: mission.completed,
        reward: mapping.reward,
        game: mapping.game,
      };
    });
  }

  async getMissionProgressWithData(missionId: number): Promise<(UserProgress & { parsedData: any }) | null> {
    const progress = await this.getMissionProgress(missionId);
    
    if (!progress) {
      return null;
    }
    
    let parsedData = null;
    if (progress.additional_data) {
      try {
        parsedData = typeof progress.additional_data === 'string'
          ? JSON.parse(progress.additional_data)
          : progress.additional_data;
      } catch {
        parsedData = null;
      }
    }
    
    return {
      ...progress,
      parsedData
    };
  }
}

export const missionService = new MissionService();