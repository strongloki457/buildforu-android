import { Router } from "express";
import { listNotifications } from "../controllers/notifications.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authenticate, listNotifications);

export default router;
