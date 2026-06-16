import { apiClient } from '../../../shared/api/api.client';
import { missionService } from '../../missions/service/mission.service';

export interface UserProfile {
  id: number;
  username: string;
  email?: string;
  avatar?: string | null;
  createdAt: string;
}

export interface UserStats {
  totalMissions: number;
  completedMissions: number;
  favoriteMissions: number;
  totalLevels: number;
}

class ProfileService {
  private getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  async getCurrentUser(): Promise<UserProfile> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token found');
    }
    const response = await apiClient.get<{ data: UserProfile }>('/users/me', token);
    return response.data;
  }

  async getUserStats(): Promise<UserStats> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token found');
    }
    
    try {
      const response = await apiClient.get<{ data: UserStats }>('/users/me/stats', token);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      return {
        totalMissions: 0,
        completedMissions: 0,
        favoriteMissions: 0,
        totalLevels: 0,
      };
    }
  }

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const token = this.getToken();
    const response = await apiClient.put<{ data: UserProfile }>('/users/me', data, token || undefined);
    return response.data;
  }

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const token = this.getToken();
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await fetch('http://localhost:3000/api/users/me/avatar', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to upload avatar');
    }
    
    return response.json();
  }

  async getPuzzleStats(): Promise<{
    totalSatellitesCompleted: number;
    totalStarsEarned: number;
  }> {
    const token = this.getToken();
    if (!token) throw new Error('No token found');
  
    try {
      const progress = await missionService.getMissionProgress(5); // ID миссии пазла
      const puzzleData = progress?.additional_data || {};
    
      let totalSatellitesCompleted = 0;
      let totalStarsEarned = 0;
    
      Object.values(puzzleData).forEach((satellite: any) => {
        let satelliteCompleted = true;
        Object.values(satellite).forEach((level: any) => {
          totalStarsEarned += level.stars || 0;
          if (!level.completed) satelliteCompleted = false;
        });
        if (satelliteCompleted && Object.keys(satellite).length === 2) {
        totalSatellitesCompleted++;
      }
    });
    
    return { totalSatellitesCompleted, totalStarsEarned };
  } catch (error) {
    console.error('Failed to get puzzle stats:', error);
    return { totalSatellitesCompleted: 0, totalStarsEarned: 0 };
  }
}
}

export const profileService = new ProfileService();