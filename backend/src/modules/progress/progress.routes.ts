import { Router } from "express";
import {
  getUserProgress,
  getMissionProgress,
  updateMissionProgress,
  initializeProgress,
} from "./progress.controller";

const router = Router();

router.get("/", getUserProgress);
router.get("/:missionId", getMissionProgress);
router.post("/:missionId/update", updateMissionProgress);
router.post("/initialize", initializeProgress);

export default router;