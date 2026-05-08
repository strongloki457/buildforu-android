import type { Request, Response } from "express";
import * as materialsService from "../services/materials.service";
import type { MaterialsQuery } from "../validators/materials.validators";
import { asyncHandler } from "../utils/asyncHandler";

export const listMaterialRequests = asyncHandler(async (req: Request, res: Response) => {
  const result = await materialsService.listMaterialRequests(req.user!, req.query as unknown as MaterialsQuery);
  res.json(result);
});

export const createMaterialRequest = asyncHandler(async (req: Request, res: Response) => {
  const materialRequest = await materialsService.createMaterialRequest(req.user!, req.body);
  res.status(201).json({ materialRequest });
});

export const updateMaterialRequestStatus = asyncHandler(async (req: Request, res: Response) => {
  const materialRequest = await materialsService.updateMaterialRequestStatus(req.user!, req.params.id, req.body.status);
  res.json({ materialRequest });
});

export const deleteMaterialRequest = asyncHandler(async (req: Request, res: Response) => {
  await materialsService.deleteMaterialRequest(req.user!, req.params.id);
  res.status(204).send();
});
