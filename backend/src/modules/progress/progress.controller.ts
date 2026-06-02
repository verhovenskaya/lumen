import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import {
  getUserProgressService,
  getProgressByMissionService,
  updateProgressService,
  createProgressService,
} from "./progress.service";

export const getUserProgress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }
    
    const progress = await getUserProgressService(userId);
    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error("Error in getUserProgress:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user progress",
    });
  }
};

export const getMissionProgress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }
    
    const missionId = parseInt(req.params.missionId);
    
    if (isNaN(missionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mission ID",
      });
    }
    
    const progress = await getProgressByMissionService(userId, missionId);
    
    res.json({
      success: true,
      data: progress || null,
    });
  } catch (error) {
    console.error("Error in getMissionProgress:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching mission progress",
    });
  }
};

export const updateMissionProgress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }
    
    const missionId = parseInt(req.params.missionId);
    
    if (isNaN(missionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mission ID",
      });
    }
    
    const { currentLevel, additionalData } = req.body;

    if (!currentLevel || currentLevel < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid current level",
      });
    }

    const progress = await updateProgressService(
      userId,
      missionId,
      currentLevel,
      additionalData
    );

    res.json({
      success: true,
      data: progress,
      message: "Progress updated successfully",
    });
  } catch (error: any) {
    console.error("Progress error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating progress",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const initializeProgress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }
    
    const { missionId } = req.body;

    if (!missionId) {
      return res.status(400).json({
        success: false,
        message: "Mission ID is required",
      });
    }

    const progress = await createProgressService(userId, missionId);

    res.json({
      success: true,
      data: progress,
      message: "Progress initialized successfully",
    });
  } catch (error: any) {
    console.error("Error in initializeProgress:", error);
    res.status(500).json({
      success: false,
      message: "Error initializing progress",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};