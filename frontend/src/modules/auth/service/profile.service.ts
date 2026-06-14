// src/modules/profile/service/profile.service.ts

import { apiClient } from '../../../shared/api/api.client';

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

  async getProfile(userId: number): Promise<UserProfile> {
    const token = this.getToken();
    const response = await apiClient.get<{ data: UserProfile }>(`/users/${userId}`, token || undefined);
    return response.data;
  }

  async getCurrentUser(): Promise<UserProfile> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token found');
    }
    const response = await apiClient.get<{ data: UserProfile }>('/users/me', token);
    return response.data;
  }

  async getUserStats(userId: number): Promise<UserStats> {
    const token = this.getToken();
    const response = await apiClient.get<{ data: UserStats }>(`/users/${userId}/stats`, token || undefined);
    return response.data;
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
}

export const profileService = new ProfileService();