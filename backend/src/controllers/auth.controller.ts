import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as authService from "../services/auth.service";
import { env } from "../config/env";

const IS_PRODUCTION = env.NODE_ENV === "production";

const BASE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: "lax" as "lax",
  path: "/"
} as const;

const ACCESS_MAX_AGE = 60 * 60 * 1000;         // 1 hour
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

function setAuthCookies(res: Response, token: string, refreshToken: string, remember: boolean) {
  if (remember) {
    res.cookie("authToken", token, { ...BASE_COOKIE_OPTIONS, maxAge: ACCESS_MAX_AGE });
    res.cookie("refreshToken", refreshToken, { ...BASE_COOKIE_OPTIONS, maxAge: REFRESH_MAX_AGE });
  } else {
    // Session cookies — cleared when browser closes
    res.cookie("authToken", token, BASE_COOKIE_OPTIONS);
    res.cookie("refreshToken", refreshToken, BASE_COOKIE_OPTIONS);
  }
}

function clearAuthCookies(res: Response) {
  res.clearCookie("authToken", BASE_COOKIE_OPTIONS);
  res.clearCookie("refreshToken", BASE_COOKIE_OPTIONS);
}

function getLang(req: Request): string | undefined {
  const header = req.headers["accept-language"];
  if (!header || typeof header !== "string") return undefined;
  return header.split(",")[0].trim().split("-")[0].toLowerCase() || undefined;
}

export const registerCompany = asyncHandler(async (req: Request, res: Response) => {
  const { token, refreshToken, user } = await authService.registerCompany(req.body, getLang(req));
  setAuthCookies(res, token, refreshToken, true);
  res.status(201).json({ user });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const remember: boolean = req.body.rememberMe !== false;
  const { token, refreshToken, user } = await authService.login(req.body);
  setAuthCookies(res, token, refreshToken, remember);
  res.json({ user });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  clearAuthCookies(res);
  res.status(204).send();
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getCurrentUser(req.user!.userId);
  res.json({ user });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const rawRefreshToken = req.cookies?.refreshToken;
  if (!rawRefreshToken || typeof rawRefreshToken !== "string") {
    res.status(401).json({ error: { code: "MISSING_REFRESH_TOKEN", message: "Refresh token is required." } });
    return;
  }

  const { token, refreshToken, user } = await authService.refreshAccessToken(rawRefreshToken);
  setAuthCookies(res, token, refreshToken, true);
  res.json({ user });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.requestPasswordReset(req.body, getLang(req));
  res.json(result);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.resetPassword(req.body, getLang(req));
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
  const result = await authService.resendVerificationEmail(req.user!.userId, getLang(req));
  res.json(result);
});

export const deleteMe = asyncHandler(async (req: Request, res: Response) => {
  await authService.deleteAccount(req.user!.userId);
  clearAuthCookies(res);
  res.status(204).send();
});
