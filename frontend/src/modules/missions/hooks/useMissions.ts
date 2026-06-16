import { useState, useEffect, useCallback } from 'react';
import { missionService, type MissionUI } from '../service/mission.service';

export const useMissions = () => {
  const [missions, setMissions] = useState<MissionUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const loadMissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading missions UI...');
      const data = await missionService.getMissionsUI();
      console.log('Missions UI loaded:', data);
      setMissions(data);
    } catch (err: any) {
      console.error('Error loading missions:', err);
      setError(err.message || 'Failed to load missions');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProgress = useCallback(async (missionId: number, currentLevel: number, additionalData?: any) => {
    setUpdating(true);
    try {
      const updated = await missionService.updateProgress(missionId, currentLevel, additionalData);
      console.log('Progress updated on backend:', updated);
      
      await loadMissions();
      
      return updated;
    } catch (err: any) {
      console.error('Error updating progress:', err);
      throw err;
    } finally {
      setUpdating(false);
    }
  }, [loadMissions]);

  const completeMission = useCallback(async (missionId: string) => {
    const mission = missions.find(m => m.id === missionId);
    if (mission && !mission.completed) {
      console.log('Completing mission:', missionId, 'Max progress:', mission.maxProgress);
      await updateProgress(parseInt(missionId), mission.maxProgress);
    }
  }, [missions, updateProgress]);

  const refreshMissions = useCallback(async () => {
    await loadMissions();
  }, [loadMissions]);

  const markPlanetViewed = useCallback((planetId: string) => {
    console.log('markPlanetViewed:', planetId);
  }, []);

  useEffect(() => {
    loadMissions();
  }, [loadMissions]);

  return {
    missions,
    loading,
    error,
    updating,
    loadMissions,
    updateProgress,
    completeMission,
    refreshMissions,  
    markPlanetViewed,
  };
};