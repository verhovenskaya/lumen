import { getAllMissions, getMissionById } from "./mission.repository";

export const getAllMissionsService = async () => {
  return await getAllMissions();
};

export const getMissionByIdService = async (missionId: number) => {
  const mission = await getMissionById(missionId);
  if (!mission) {
    throw new Error("Mission not found");
  }
  return mission;
};