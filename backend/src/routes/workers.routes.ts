import { Role } from "@prisma/client";
import { Router } from "express";
import * as workersController from "../controllers/workers.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import { idParamSchema, paginationQuerySchema } from "../validators/common.validators";
import { createWorkerSchema, updateWorkerSchema } from "../validators/workers.validators";

const router = Router();

router.use(authenticate);
router.use(requireRole(Role.ADMIN));

router.get("/", validate({ query: paginationQuerySchema }), workersController.listWorkers);
router.post("/", validate({ body: createWorkerSchema }), workersController.createWorker);
router.patch("/:id", validate({ params: idParamSchema, body: updateWorkerSchema }), workersController.updateWorker);
router.delete("/:id", validate({ params: idParamSchema }), workersController.deleteWorker);

export default router;
