import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as authService from "../services/auth.service";

export const registerCompany = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.registerCompany(req.body);
  res.status(201).json(result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  res.json(result);
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getCurrentUser(req.user!.userId);
  res.json({ user });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.requestPasswordReset(req.body);
  res.json(result);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.resetPassword(req.body);
  res.json(result);
});

export const updateAvatar = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.updateAvatar(req.user!.userId, req.body.avatarUrl);
  res.json(result);
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.query;
  if (!token || typeof token !== "string") {
    res.status(400).json({ error: { code: "MISSING_TOKEN", message: "Token is required." } });
    return;
  }
  const result = await authService.verifyEmail(token);
  res.json(result);
});

export const resendVerification = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.resendVerificationEmail(req.user!.userId);
  res.json(result);
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken || typeof refreshToken !== "string") {
    res.status(400).json({ error: { code: "MISSING_REFRESH_TOKEN", message: "Refresh token is required." } });
    return;
  }

  const result = await authService.refreshAccessToken(refreshToken);
  res.json(result);
});

export const deleteMe = asyncHandler(async (req: Request, res: Response) => {
  await authService.deleteAccount(req.user!.userId);
  res.status(204).send();
});
