import { Prisma } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { env } from "../config/env";
import { AppError } from "../utils/errors";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(new AppError(404, `Route ${req.method} ${req.path} was not found.`, "ROUTE_NOT_FOUND"));
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed.",
        details: error.flatten()
      }
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    res.status(503).json({
      error: {
        code: "DATABASE_UNAVAILABLE",
        message: "Database connection is unavailable."
      }
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      res.status(409).json({
        error: {
          code: "UNIQUE_CONSTRAINT",
          message: "A record with this unique value already exists."
        }
      });
      return;
    }

    if (error.code === "P2025") {
      res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "The requested resource was not found."
        }
      });
      return;
    }
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    });
    return;
  }

  const responseBody: Record<string, unknown> = {
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred."
    }
  };

  if (env.NODE_ENV !== "production" && error instanceof Error) {
    responseBody.error = {
      ...(responseBody.error as object),
      stack: error.stack
    };
  }

  res.status(500).json(responseBody);
}
