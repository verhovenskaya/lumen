import express from "express";
import { authMiddleware } from "./middleware/auth.middleware";
import authRoutes from "./modules/auth/auth.routes";
import missionRoutes from "./modules/mission/mission.routes";
import progressRoutes from "./modules/progress/progress.routes";

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/missions", authMiddleware, missionRoutes);
app.use("/api/progress", authMiddleware, progressRoutes);

export default app;