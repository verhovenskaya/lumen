import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export interface AuthRequest extends Request {
  user?: {
    userId: number;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    console.log("Auth header:", authHeader);
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token extracted:", token.substring(0, 20) + "...");
    
    const decoded = verifyToken(token);
    console.log("Decoded token:", decoded);
    
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    req.user = { userId: decoded.userId };
    next();
  } catch (error: any) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};