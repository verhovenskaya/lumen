import { Router } from "express";
import { getAllMissions, getMission } from "./mission.controller";

const router = Router();

router.get("/", getAllMissions);
router.get("/:id", getMission);

export default router;