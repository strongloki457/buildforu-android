import { Role } from "@prisma/client";
import { Router } from "express";
import * as materialsController from "../controllers/materials.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import { idParamSchema } from "../validators/common.validators";
import {
  createMaterialRequestSchema,
  materialsQuerySchema,
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
router.delete("/:id", requireRole(Role.ADMIN), validate({ params: idParamSchema }), materialsController.deleteMaterialRequest);

export default router;
