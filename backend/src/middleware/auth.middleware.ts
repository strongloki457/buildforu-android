import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/errors";
import { verifyAccessToken } from "../utils/jwt";

function getTokenFromRequest(req: Request): string {
  // Cookie-based auth (httpOnly — preferred, not accessible to JS)
  const cookieToken = req.cookies?.authToken;
  if (cookieToken && typeof cookieToken === "string") return cookieToken.trim();

  // Authorization header fallback (backwards compatibility)
  const header = req.header("authorization");
  if (header?.startsWith("Bearer ")) return header.slice(7).trim();

  return "";
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      throw new AppError(401, "Authentication token is required.", "AUTH_REQUIRED");
    }

    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyId: true,
        workerId: true
      }
    });

    if (!user || user.companyId !== payload.companyId) {
      throw new AppError(401, "Authentication token is invalid.", "AUTH_INVALID");
    }

    req.user = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      workerId: user.workerId
    };

    next();
  } catch (error) {
    next(error instanceof AppError ? error : new AppError(401, "Authentication token is invalid.", "AUTH_INVALID"));
  }
}
