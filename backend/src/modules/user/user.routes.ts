import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { getCurrentUser, getUserStats } from "./user.controller";

const router = Router();

router.use(authMiddleware);

router.get("/me", getCurrentUser);
router.get("/me/stats", getUserStats);

export default router;