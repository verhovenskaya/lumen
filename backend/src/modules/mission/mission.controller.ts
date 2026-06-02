import { Request, Response } from "express";
import { getAllMissionsService, getMissionByIdService } from "./mission.service";

export const getAllMissions = async (req: Request, res: Response) => {
  try {
    const missions = await getAllMissionsService();
    res.json({
      success: true,
      data: missions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching missions",
    });
  }
};

export const getMission = async (req: Request, res: Response) => {
  try {
    const missionId = parseInt(req.params.id);
    const mission = await getMissionByIdService(missionId);
    res.json({
      success: true,
      data: mission,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "Mission not found",
    });
  }
};