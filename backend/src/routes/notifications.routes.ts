import { Router } from "express";
import rateLimit from "express-rate-limit";
import { listNotifications } from "../controllers/notifications.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

const notificationsRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: {
      code: "RATE_LIMITED",
      message: "Too many requests. Please try again later."
    }
  }
});

router.get("/", notificationsRateLimit, authenticate, listNotifications);

export default router;
