import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import { authMiddleware } from "./middleware/auth.middleware";
import authRoutes from "./modules/auth/auth.routes";
import missionRoutes from "./modules/mission/mission.routes";
import progressRoutes from "./modules/progress/progress.routes";
import cors from 'cors';
import userRoutes from "./modules/user/user.routes";

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options('*', cors());

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/missions", missionRoutes);
app.use("/api/progress", authMiddleware, progressRoutes);
app.use("/api/users", userRoutes);

export default app;