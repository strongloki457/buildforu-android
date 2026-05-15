import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as authController from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { forgotPasswordSchema, loginSchema, registerCompanySchema, resetPasswordSchema } from "../validators/auth.validators";

const router = Router();

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    error: {
      code: "RATE_LIMITED",
      message: "Too many authentication attempts. Please try again later."
    }
  }
});

router.post("/register-company", authRateLimit, validate({ body: registerCompanySchema }), authController.registerCompany);
router.post("/login", authRateLimit, validate({ body: loginSchema }), authController.login);
router.get("/me", authenticate, authController.me);
router.post("/forgot-password", authRateLimit, validate({ body: forgotPasswordSchema }), authController.forgotPassword);
router.post("/reset-password", authRateLimit, validate({ body: resetPasswordSchema }), authController.resetPassword);

export default router;
