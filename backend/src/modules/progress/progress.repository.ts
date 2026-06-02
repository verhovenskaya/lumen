import { pool } from "../../db/postgres";

export const getUserProgress = async (userId: number) => {
  const result = await pool.query(
    `SELECT 
      up.id,
      up.mission_id,
      m.name as mission_name,
      m.max_level,
      up.current_level,
      up.completed,
      up.additional_data,
      up.updated_at
     FROM user_progress up
     JOIN missions m ON up.mission_id = m.id
     WHERE up.user_id = $1
     ORDER BY up.mission_id`,
    [userId]
  );
  return result.rows;
};

export const getProgressByMission = async (userId: number, missionId: number) => {
  const result = await pool.query(
    `SELECT 
      up.id,
      up.mission_id,
      m.name as mission_name,
      m.max_level,
      up.current_level,
      up.completed,
      up.additional_data,
      up.updated_at
     FROM user_progress up
     JOIN missions m ON up.mission_id = m.id
     WHERE up.user_id = $1 AND up.mission_id = $2`,
    [userId, missionId]
  );
  return result.rows[0];
};

export const createProgress = async (
  userId: number,
  missionId: number,
  currentLevel: number = 1,
  additionalData: any = null
) => {
  const result = await pool.query(
    `INSERT INTO user_progress (user_id, mission_id, current_level, additional_data) 
     VALUES ($1, $2, $3, $4) 
     ON CONFLICT (user_id, mission_id) 
     DO UPDATE SET 
       current_level = EXCLUDED.current_level,
       updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [userId, missionId, currentLevel, additionalData ? JSON.stringify(additionalData) : null]
  );
  return result.rows[0];
};

export const updateProgress = async (
  userId: number,
  missionId: number,
  currentLevel: number,
  completed: boolean = false,
  additionalData: any = null
) => {
  const result = await pool.query(
    `UPDATE user_progress 
     SET current_level = $3, 
         completed = $4, 
         additional_data = $5,
         updated_at = CURRENT_TIMESTAMP
     WHERE user_id = $1 AND mission_id = $2
     RETURNING *`,
    [userId, missionId, currentLevel, completed, additionalData ? JSON.stringify(additionalData) : null]
  );
  return result.rows[0];
};

export const initializeUserMission = async (userId: number, missionId: number) => {
  const result = await pool.query(
    `INSERT INTO user_progress (user_id, mission_id, current_level, completed, additional_data) 
     VALUES ($1, $2, 1, FALSE, NULL)
     ON CONFLICT (user_id, mission_id) DO NOTHING
     RETURNING *`,
    [userId, missionId]
  );
  return result.rows[0];
};