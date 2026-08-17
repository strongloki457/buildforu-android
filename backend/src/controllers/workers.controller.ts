import type { Request, Response } from "express";
import * as workersService from "../services/workers.service";
import type { PaginationQuery } from "../types/api";
import { asyncHandler } from "../utils/asyncHandler";

function getLang(req: Request): string | undefined {
  const header = req.headers["accept-language"];
  if (!header || typeof header !== "string") return undefined;
  return header.split(",")[0].trim().split("-")[0].toLowerCase() || undefined;
}

export const listWorkers = asyncHandler(async (req: Request, res: Response) => {
  const result = await workersService.listWorkers(req.user!, req.query as unknown as PaginationQuery);
  res.json(result);
});

export const createWorker = asyncHandler(async (req: Request, res: Response) => {
  const result = await workersService.createWorker(req.user!, req.body, getLang(req));
  res.status(201).json(result);
});

export const updateWorker = asyncHandler(async (req: Request, res: Response) => {
  const result = await workersService.updateWorker(req.user!, req.params.id, req.body);
  res.json(result);
});

export const deleteWorker = asyncHandler(async (req: Request, res: Response) => {
  await workersService.deleteWorker(req.user!, req.params.id);
  res.status(204).send();
});

export const updateWorkerRate = asyncHandler(async (req: Request, res: Response) => {
  const worker = await workersService.updateWorkerRate(req.user!, req.params.id, req.body.hourlyRate);
  res.json({ worker });
});
