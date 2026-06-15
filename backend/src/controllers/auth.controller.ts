import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as authService from "../services/auth.service";
import { verifyAccessToken } from "../utils/jwt";
import { AppError } from "../utils/errors";
import { env } from "../config/env";

const IS_PRODUCTION = env.NODE_ENV === "production";

const BASE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: "lax" as "lax",
  path: "/",
  ...(IS_PRODUCTION ? { domain: ".buildforu.eu" } : {})
};

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
  res.status(201).json({ user, token, refreshToken });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const remember: boolean = req.body.rememberMe !== false;
  const result = await authService.login(req.body);

  // Multi-company: don't set cookies yet, let frontend pick a company
  if ("requiresCompanySelection" in result && result.requiresCompanySelection) {
    res.json(result);
    return;
  }

  const { token, refreshToken, user } = result as { token: string; refreshToken: string; user: unknown };
  setAuthCookies(res, token, refreshToken, remember);
  res.json({ user, token, refreshToken });
});

export const selectCompany = asyncHandler(async (req: Request, res: Response) => {
  const remember: boolean = req.body.rememberMe !== false;
  const { companyId, selectionToken } = req.body;

  if (!companyId || typeof companyId !== "string") {
    throw new AppError(400, "companyId is required.", "VALIDATION_ERROR");
  }

  if (!selectionToken || typeof selectionToken !== "string") {
    throw new AppError(400, "selectionToken is required.", "VALIDATION_ERROR");
  }

  let userId: string;
  try {
    const payload = verifyAccessToken(selectionToken);
    if (payload.companyId !== "__pending__") {
      throw new Error("not a selection token");
    }
    userId = payload.userId;
  } catch {
    throw new AppError(401, "Selection token is invalid or has expired.", "AUTH_INVALID");
  }

  const { token, refreshToken, user } = await authService.selectCompany(userId, companyId);
  setAuthCookies(res, token, refreshToken, remember);
  res.json({ user, token, refreshToken });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  clearAuthCookies(res);
  res.status(204).send();
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getCurrentUser(req.user!.userId, req.user!.companyId, req.user!.role);
  res.json({ user });
});

export const switchCompany = asyncHandler(async (req: Request, res: Response) => {
  const remember: boolean = req.body.rememberMe !== false;
  const { companyId } = req.body;

  if (!companyId || typeof companyId !== "string") {
    throw new AppError(400, "companyId is required.", "VALIDATION_ERROR");
  }

  const { token, refreshToken, user } = await authService.switchCompany(
    req.user!.userId,
    companyId
  );
  setAuthCookies(res, token, refreshToken, remember);
  res.json({ user, token, refreshToken });
});

export const switchRole = asyncHandler(async (req: Request, res: Response) => {
  const remember: boolean = req.body.rememberMe !== false;
  const targetRole = req.body.role;

  if (targetRole !== "ADMIN" && targetRole !== "EMPLOYEE") {
    throw new AppError(400, "role must be 'ADMIN' or 'EMPLOYEE'.", "VALIDATION_ERROR");
  }

  const { token, refreshToken, user } = await authService.switchRole(
    req.user!.userId,
    req.user!.companyId,
    targetRole
  );
  setAuthCookies(res, token, refreshToken, remember);
  res.json({ user, token, refreshToken });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!rawRefreshToken || typeof rawRefreshToken !== "string") {
    res.status(401).json({ error: { code: "MISSING_REFRESH_TOKEN", message: "Refresh token is required." } });
    return;
  }

  const { token, refreshToken, user } = await authService.refreshAccessToken(rawRefreshToken);
  setAuthCookies(res, token, refreshToken, true);
  res.json({ user, token, refreshToken });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.requestPasswordReset(req.body, getLang(req));
  res.json(result);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.resetPassword(req.body, getLang(req));
  res.json(result);
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.changePassword(req.user!.userId, req.body, getLang(req));
  res.json(result);
});

export const updateAvatar = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.updateAvatar(req.user!.userId, req.user!.companyId, req.body.avatarUrl);
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
