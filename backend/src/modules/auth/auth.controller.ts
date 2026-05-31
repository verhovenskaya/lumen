import { Request, Response } from "express";
import * as authService from "./auth.service";

export const register = async (
  req: Request,
  res: Response
) => {
  try {
    const { username, password } =
      req.body;

    const result =
      await authService.register(
        username,
        password
      );

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const { username, password } =
      req.body;

    const result =
      await authService.login(
        username,
        password
      );

    res.json(result);
  } catch (error: any) {
    res.status(401).json({
      message: error.message,
    });
  }
};