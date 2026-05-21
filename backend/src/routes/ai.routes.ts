import { Router } from "express";
import rateLimit from "express-rate-limit";
import { chat } from "../controllers/ai.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: {
      code: "RATE_LIMITED",
      message: "Too many AI requests. Please wait a moment and try again."
    }
  }
});

router.use(authenticate);
router.post("/chat", aiRateLimit, chat);

export default router;
