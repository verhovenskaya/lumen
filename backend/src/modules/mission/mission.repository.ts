import { pool } from "../../db/postgres";

export const getAllMissions = async () => {
  const result = await pool.query(
    `SELECT id, name, description, max_level FROM missions ORDER BY id`
  );
  return result.rows;
};

export const getMissionById = async (missionId: number) => {
  const result = await pool.query(
    `SELECT id, name, description, max_level FROM missions WHERE id = $1`,
    [missionId]
  );
  return result.rows[0];
};