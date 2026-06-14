import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { findUserById } from "./user.repository";

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        createdAt: user.created_at,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching user" });
  }
};

export const getUserStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    // Здесь нужно получить статистику из базы
    const stats = {
      totalMissions: 10, // из таблицы missions
      completedMissions: 0, // из таблицы user_progress где completed=true
      favoriteMissions: 0, // если есть таблица favorites
      totalLevels: 0, // сумма current_level из user_progress
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching stats" });
  }
};