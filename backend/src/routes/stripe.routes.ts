import express, { Router } from "express";
import * as stripeController from "../controllers/stripe.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Webhook musi mieć raw body — montowany przed express.json() w app.ts
router.post("/webhook", express.raw({ type: "application/json" }), stripeController.webhook);

router.post("/create-checkout-session", authenticate, stripeController.createCheckoutSession);
router.post("/portal", authenticate, stripeController.createPortalSession);
router.get("/subscription", authenticate, stripeController.getSubscription);
router.get("/verify-session", authenticate, stripeController.verifySession);

export default router;
