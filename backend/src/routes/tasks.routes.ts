import { Role } from "@prisma/client";
import { Router } from "express";
import * as tasksController from "../controllers/tasks.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import { idParamSchema } from "../validators/common.validators";
import { createTaskSchema, tasksQuerySchema, updateTaskSchema } from "../validators/tasks.validators";

const router = Router();

router.use(authenticate);

router.get("/", validate({ query: tasksQuerySchema }), tasksController.listTasks);
router.post("/", requireRole(Role.ADMIN), validate({ body: createTaskSchema }), tasksController.createTask);
router.patch("/:id", validate({ params: idParamSchema, body: updateTaskSchema }), tasksController.updateTask);
router.delete("/:id", requireRole(Role.ADMIN), validate({ params: idParamSchema }), tasksController.deleteTask);

export default router;
