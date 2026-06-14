import { useState, useEffect } from 'react';
import { profileService, type UserProfile, type UserStats } from '../service/profile.service';
import { authService } from '../../auth/service/auth.service';

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const user = authService.getUser();
      if (!user || !user.id) {
        throw new Error('User not found');
      }
      
      const [profileData, statsData] = await Promise.all([
        profileService.getCurrentUser(),
        profileService.getUserStats(user.id)
      ]);
      
      setProfile(profileData);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
      console.error('Load profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      const updated = await profileService.updateProfile(data);
      setProfile(updated);
      return updated;
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      throw err;
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      const result = await profileService.uploadAvatar(file);
      if (profile) {
        setProfile({ ...profile, avatar: result.avatarUrl });
      }
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to upload avatar');
      throw err;
    }
  };

  const refreshProfile = () => {
    loadProfile();
  };

  return {
    profile,
    stats,
    loading,
    error,
    updateProfile,
    uploadAvatar,
    refreshProfile,
  };
};