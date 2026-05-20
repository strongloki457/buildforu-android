import { Role } from "@prisma/client";
import { Router } from "express";
import * as attendanceController from "../controllers/attendance.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import { idParamSchema } from "../validators/common.validators";
import {
  attendanceLocationPointSchema,
  attendanceLocationSchema,
  attendanceQuerySchema
} from "../validators/attendance.validators";

const router = Router();

router.use(authenticate);

router.get("/", validate({ query: attendanceQuerySchema }), attendanceController.listAttendance);
router.get(
  "/:id/locations",
  validate({ params: idParamSchema }),
  attendanceController.listAttendanceLocations
);
router.post(
  "/location",
  requireRole(Role.EMPLOYEE),
  validate({ body: attendanceLocationPointSchema }),
  attendanceController.recordLocationPoint
);
router.post(
  "/start",
  requireRole(Role.EMPLOYEE),
  validate({ body: attendanceLocationSchema }),
  attendanceController.startAttendance
);
router.post(
  "/end",
  requireRole(Role.EMPLOYEE),
  validate({ body: attendanceLocationSchema }),
  attendanceController.endAttendance
);

export default router;
