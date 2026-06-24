import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/errors";

export function requirePlan(...plans: string[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(401, "Authentication is required.", "AUTH_REQUIRED");
      }

      const company = await prisma.company.findUnique({
        where: { id: req.user.companyId },
        select: { plan: true, isFree: true }
      });

      if (!company || (!company.isFree && !plans.includes(company.plan))) {
        throw new AppError(403, "This feature is not available on your current plan.", "PLAN_REQUIRED");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
