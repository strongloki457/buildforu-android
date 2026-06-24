import { Role } from "@prisma/client";
import { Router } from "express";
import * as workersController from "../controllers/workers.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requirePlan } from "../middleware/plan.middleware";
import { requireRole } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import { idParamSchema, paginationQuerySchema } from "../validators/common.validators";
import { createWorkerSchema, updateWorkerRateSchema, updateWorkerSchema } from "../validators/workers.validators";

const router = Router();

router.use(authenticate);
router.use(requireRole(Role.ADMIN));

router.get("/", validate({ query: paginationQuerySchema }), workersController.listWorkers);
router.post("/", validate({ body: createWorkerSchema }), workersController.createWorker);
router.patch("/:id", validate({ params: idParamSchema, body: updateWorkerSchema }), workersController.updateWorker);
router.patch(
  "/:id/rate",
  requirePlan("pro", "business", "enterprise"),
  validate({ params: idParamSchema, body: updateWorkerRateSchema }),
  workersController.updateWorkerRate
);
router.delete("/:id", validate({ params: idParamSchema }), workersController.deleteWorker);

export default router;
