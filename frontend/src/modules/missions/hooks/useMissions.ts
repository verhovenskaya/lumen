import { useState, useCallback } from 'react';

export interface Mission {
  id: string;
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
  reward: string;
  game?: string;
}

const STORAGE_KEY = 'lumen_missions_v5';  
const VIEWED_PLANETS_KEY = 'lumen_viewed_planets_v5';

const defaultMissions: Mission[] = [
  {
    id: 'rover_mission',
    title: 'Марсоход-исследователь',
    description: 'Управляй ровером и собери 5 кратеров за 3 минуты',
    progress: 0,
    maxProgress: 1,
    completed: false,
    reward: 'Значок "Марсианин"',
    game: 'rover',
  },
  {
    id: 'puzzle_mission',
    title: 'Спутниковый конструктор',
    description: 'Собери 3 спутника из пазлов за 5 минут',
    progress: 0,
    maxProgress: 1,
    completed: false,
    reward: 'Значок "Инженер"',
    game: 'puzzle',
  },
  {
    id: 'anomaly_mission',
    title: 'Космический детектив',
    description: 'Найди 5 аномалий и расставь планеты по местам за 4 минуты',
    progress: 0,
    maxProgress: 1,
    completed: false,
    reward: 'Значок "Детектив"',
    game: 'anomaly',
  },
];

const loadMissions = (): Mission[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return defaultMissions;
};

const saveMissions = (missions: Mission[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(missions));
};

const loadViewedPlanets = (): string[] => {
  try {
    const saved = localStorage.getItem(VIEWED_PLANETS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveViewedPlanets = (planets: string[]) => {
  localStorage.setItem(VIEWED_PLANETS_KEY, JSON.stringify(planets));
};

export const useMissions = () => {
  const [missions, setMissions] = useState<Mission[]>(loadMissions);
  const [viewedPlanets, setViewedPlanets] = useState<string[]>(loadViewedPlanets);

  const markPlanetViewed = useCallback((planetId: string) => {
    setViewedPlanets(prev => {
      if (prev.includes(planetId)) return prev;
      const next = [...prev, planetId];
      saveViewedPlanets(next);
      return next;
    });
  }, []);

  const completeMission = useCallback((missionId: string) => {
    setMissions(prev => {
      const updated = prev.map(m => {
        if (m.id === missionId && !m.completed) {
          return { ...m, progress: m.maxProgress, completed: true };
        }
        return m;
      });
      saveMissions(updated);
      return updated;
    });
  }, []);

  const resetMissions = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(VIEWED_PLANETS_KEY);
    setViewedPlanets([]);
    setMissions(defaultMissions);
  }, []);

  return {
    missions,
    viewedPlanetsCount: viewedPlanets.length,
    markPlanetViewed,
    completeMission,
    resetMissions,
  };
};