import type { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
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

    // Pending selection token is only valid for /select-company — block all other routes
    if (payload.companyId === "__pending__") {
      const isPendingAllowed = req.path === "/select-company" || req.originalUrl.endsWith("/select-company");
      if (!isPendingAllowed) {
        throw new AppError(401, "Authentication token is invalid.", "AUTH_INVALID");
      }
      req.user = {
        userId: payload.userId,
        name: "",
        email: "",
        role: payload.role,
        companyId: "__pending__",
        workerId: null
      };
      next();
      return;
    }

    const membership = await prisma.userCompany.findUnique({
      where: {
        userId_companyId: {
          userId: payload.userId,
          companyId: payload.companyId
        }
      },
      select: {
        role: true,
        workerId: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!membership) {
      throw new AppError(401, "Authentication token is invalid.", "AUTH_INVALID");
    }

    // Honor JWT role=EMPLOYEE for admins who have a worker profile (safe downgrade)
    const effectiveRole: Role =
      payload.role === Role.EMPLOYEE && membership.role === Role.ADMIN && membership.workerId !== null
        ? Role.EMPLOYEE
        : membership.role;

    req.user = {
      userId: membership.user.id,
      name: membership.user.name,
      email: membership.user.email,
      role: effectiveRole,
      companyId: payload.companyId,
      workerId: membership.workerId
    };

    next();
  } catch (error) {
    next(error instanceof AppError ? error : new AppError(401, "Authentication token is invalid.", "AUTH_INVALID"));
  }
}
