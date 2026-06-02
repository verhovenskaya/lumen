import {
  getUserProgress,
  getProgressByMission,
  createProgress,
  updateProgress,
  initializeUserMission,
} from "./progress.repository";
import { getMissionById } from "../mission/mission.repository";

export const getUserProgressService = async (userId: number) => {
  console.log("getUserProgressService called for userId:", userId);
  return await getUserProgress(userId);
};

export const getProgressByMissionService = async (userId: number, missionId: number) => {
  console.log("getProgressByMissionService called for:", { userId, missionId });
  return await getProgressByMission(userId, missionId);
};

export const updateProgressService = async (
  userId: number,
  missionId: number,
  currentLevel: number,
  additionalData?: any
) => {
  console.log("=== updateProgressService START ===");
  console.log("Input params:", { userId, missionId, currentLevel, additionalData });
  
  try {
    console.log("Fetching mission by ID:", missionId);
    const mission = await getMissionById(missionId);
    console.log("Mission found:", mission);
    
    if (!mission) {
      console.error("Mission not found for ID:", missionId);
      throw new Error(`Mission with id ${missionId} not found`);
    }

    console.log("Mission max_level:", mission.max_level);

    console.log("Checking existing progress...");
    let existingProgress = await getProgressByMission(userId, missionId);
    console.log("Existing progress:", existingProgress);
    
    if (!existingProgress) {
      console.log("No existing progress, initializing...");
      await initializeUserMission(userId, missionId);
      existingProgress = await getProgressByMission(userId, missionId);
      console.log("After initialization:", existingProgress);
    }

    if (currentLevel > mission.max_level) {
      console.error(`Level ${currentLevel} exceeds max ${mission.max_level}`);
      throw new Error(`Level cannot exceed mission max level (${mission.max_level})`);
    }

    const completed = currentLevel >= mission.max_level;
    console.log("Completed status:", completed);

    console.log("Calling updateProgress repository...");
    const result = await updateProgress(userId, missionId, currentLevel, completed, additionalData);
    console.log("Update result:", result);
    
    console.log("=== updateProgressService END (SUCCESS) ===");
    return result;
  } catch (error) {
    console.error("=== updateProgressService ERROR ===");
    console.error(error);
    throw error;
  }
};

export const createProgressService = async (
  userId: number,
  missionId: number,
  currentLevel: number = 1,
  additionalData?: any
) => {
  console.log("createProgressService called:", { userId, missionId, currentLevel });
  
  const mission = await getMissionById(missionId);
  if (!mission) {
    throw new Error(`Mission with id ${missionId} not found`);
  }
  
  if (currentLevel > mission.max_level) {
    throw new Error(`Level cannot exceed mission max level (${mission.max_level})`);
  }
  
  return await createProgress(userId, missionId, currentLevel, additionalData);
};