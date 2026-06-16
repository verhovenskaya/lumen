import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { findUserById } from "./user.repository";
import { pool } from "../../db/postgres";

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
    console.error('Error in getCurrentUser:', error);
    res.status(500).json({ success: false, message: "Error fetching user" });
  }
};

export const getUserStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    
    const result = await pool.query(
      `SELECT 
        COUNT(DISTINCT up.mission_id) as total_missions,
        COUNT(CASE WHEN up.completed = true THEN 1 END) as completed_missions,
        COALESCE(SUM(up.current_level), 0) as total_levels
       FROM user_progress up
       WHERE up.user_id = $1`,
      [userId]
    );
    
    const stats = result.rows[0];
    
    res.json({ 
      success: true, 
      data: {
        totalMissions: parseInt(stats.total_missions) || 0,
        completedMissions: parseInt(stats.completed_missions) || 0,
        favoriteMissions: 0, // Можно добавить позже
        totalLevels: parseInt(stats.total_levels) || 0,
      }
    });
  } catch (error) {
    console.error('Error in getUserStats:', error);
    res.status(500).json({ success: false, message: "Error fetching stats" });
  }
};