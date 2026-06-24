import { Role } from "@prisma/client";
import { Router } from "express";
import * as materialsController from "../controllers/materials.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requirePlan } from "../middleware/plan.middleware";
import { requireRole } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import { idParamSchema } from "../validators/common.validators";
import {
  createMaterialRequestSchema,
  materialsQuerySchema,
  updateMaterialCostSchema,
  updateMaterialStatusSchema
} from "../validators/materials.validators";

const router = Router();

router.use(authenticate);

router.get("/", validate({ query: materialsQuerySchema }), materialsController.listMaterialRequests);
router.post("/", validate({ body: createMaterialRequestSchema }), materialsController.createMaterialRequest);
router.patch(
  "/:id/status",
  requireRole(Role.ADMIN),
  validate({ params: idParamSchema, body: updateMaterialStatusSchema }),
  materialsController.updateMaterialRequestStatus
);
router.patch(
  "/:id/cost",
  requireRole(Role.ADMIN),
  requirePlan("pro", "business", "enterprise"),
  validate({ params: idParamSchema, body: updateMaterialCostSchema }),
  materialsController.updateMaterialCost
);
router.delete("/:id", validate({ params: idParamSchema }), materialsController.deleteMaterialRequest);

export default router;
