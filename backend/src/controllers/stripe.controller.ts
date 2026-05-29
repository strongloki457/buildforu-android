import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as stripeService from "../services/stripe.service";

export const createCheckoutSession = asyncHandler(async (req: Request, res: Response) => {
  const companyId = req.user!.companyId;
  const userEmail = req.user!.email;
  const { plan, billing } = req.body;

  if (!plan || typeof plan !== "string") {
    res.status(400).json({ error: { code: "MISSING_PLAN", message: "Plan is required." } });
    return;
  }

  const billingCycle: "monthly" | "annual" = billing === "annual" ? "annual" : "monthly";
  const result = await stripeService.createCheckoutSession(companyId, plan, userEmail, billingCycle);
  res.json(result);
});

export const createPortalSession = asyncHandler(async (req: Request, res: Response) => {
  const companyId = req.user!.companyId;
  const result = await stripeService.createBillingPortalSession(companyId);
  res.json(result);
});

export const getSubscription = asyncHandler(async (req: Request, res: Response) => {
  const companyId = req.user!.companyId;
  const result = await stripeService.getSubscriptionInfo(companyId);
  res.json(result);
});

export const verifySession = asyncHandler(async (req: Request, res: Response) => {
  const sessionId = req.query.session_id;
  if (!sessionId || typeof sessionId !== "string") {
    res.status(400).json({ error: { code: "MISSING_SESSION_ID", message: "session_id is required." } });
    return;
  }
  const result = await stripeService.verifyCheckoutSession(sessionId, req.user!.companyId);
  res.json(result);
});

export const webhook = async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"];

  if (!signature || typeof signature !== "string") {
    res.status(400).json({ error: { code: "MISSING_SIGNATURE", message: "Stripe signature missing." } });
    return;
  }

  try {
    await stripeService.handleWebhook(req.body as Buffer, signature);
    res.json({ received: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Webhook error";
    res.status(400).json({ error: { message } });
  }
};
