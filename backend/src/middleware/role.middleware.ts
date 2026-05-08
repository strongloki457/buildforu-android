import type { Role } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors";

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(new AppError(401, "Authentication is required.", "AUTH_REQUIRED"));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError(403, "You do not have permission to perform this action.", "FORBIDDEN"));
      return;
    }

    next();
  };
}
