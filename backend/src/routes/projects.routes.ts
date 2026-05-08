import { Role } from "@prisma/client";
import { Router } from "express";
import * as projectsController from "../controllers/projects.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import { idParamSchema } from "../validators/common.validators";
import {
  assignProjectWorkersSchema,
  createProjectSchema,
  projectsQuerySchema,
  updateProjectSchema
} from "../validators/projects.validators";

const router = Router();

router.use(authenticate);

router.get("/", validate({ query: projectsQuerySchema }), projectsController.listProjects);
router.post("/", requireRole(Role.ADMIN), validate({ body: createProjectSchema }), projectsController.createProject);
router.patch(
  "/:id",
  requireRole(Role.ADMIN),
  validate({ params: idParamSchema, body: updateProjectSchema }),
  projectsController.updateProject
);
router.delete("/:id", requireRole(Role.ADMIN), validate({ params: idParamSchema }), projectsController.deleteProject);
router.post(
  "/:id/workers",
  requireRole(Role.ADMIN),
  validate({ params: idParamSchema, body: assignProjectWorkersSchema }),
  projectsController.assignProjectWorkers
);

export default router;
