// eslint-disable-next-line @typescript-eslint/no-require-imports
const StripeLib = require("stripe");
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/errors";

type StripeInstance = ReturnType<typeof StripeLib>;

const PLAN_PRICE_MAP: Record<string, Record<string, string | undefined>> = {
  starter: { monthly: env.STRIPE_PRICE_ID_STARTER, annual: env.STRIPE_PRICE_ID_STARTER_ANNUAL },
  pro: { monthly: env.STRIPE_PRICE_ID_PRO, annual: env.STRIPE_PRICE_ID_PRO_ANNUAL }
};

function getStripeClient(): StripeInstance {
  if (!env.STRIPE_SECRET_KEY) {
    throw new AppError(503, "Stripe is not configured on this server.", "STRIPE_NOT_CONFIGURED");
  }
  // In development, bypass self-signed cert errors (corporate proxy / Windows cert chain)
  if (env.NODE_ENV !== "production") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const https = require("https");
    const agent = new https.Agent({ rejectUnauthorized: false });
    return new StripeLib(env.STRIPE_SECRET_KEY, { httpAgent: agent });
  }
  return new StripeLib(env.STRIPE_SECRET_KEY);
}

export async function createCheckoutSession(companyId: string, plan: string, userEmail: string, billing: "monthly" | "annual" = "monthly") {
  const stripe = getStripeClient();

  const priceId = PLAN_PRICE_MAP[plan]?.[billing] ?? PLAN_PRICE_MAP[plan]?.["monthly"];
  if (!priceId) {
    throw new AppError(400, `No Stripe price configured for plan: ${plan}`, "INVALID_PLAN");
  }

  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) {
    throw new AppError(404, "Company not found.", "COMPANY_NOT_FOUND");
  }

  if (["active", "trialing"].includes(company.stripeSubscriptionStatus ?? "")) {
    throw new AppError(409, "This company already has an active subscription.", "ALREADY_SUBSCRIBED");
  }

  let customerId = company.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: userEmail,
      metadata: { companyId }
    });
    customerId = customer.id;
    await prisma.company.update({
      where: { id: companyId },
      data: { stripeCustomerId: customerId }
    });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.FRONTEND_URL}/settings/billing`,
    metadata: { companyId, plan },
    subscription_data: {
      metadata: { companyId, plan },
      ...(plan === "starter" && billing !== "annual" ? { trial_period_days: 14 } : {})
    }
  });

  return { url: session.url as string };
}

export async function createBillingPortalSession(companyId: string) {
  const stripe = getStripeClient();

  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company?.stripeCustomerId) {
    throw new AppError(400, "No Stripe customer found for this company.", "NO_STRIPE_CUSTOMER");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: company.stripeCustomerId,
    return_url: `${env.FRONTEND_URL}/settings/billing`
  });

  return { url: session.url as string };
}

export async function handleWebhook(rawBody: Buffer, signature: string) {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new AppError(503, "Stripe webhook secret is not configured.", "STRIPE_NOT_CONFIGURED");
  }

  const stripe = getStripeClient();

  let event: { id: string; type: string; data: { object: Record<string, unknown> } };
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    throw new AppError(400, "Webhook signature verification failed.", "WEBHOOK_INVALID_SIGNATURE");
  }

  // Deduplicate — skip already-processed events
  try {
    await prisma.stripeWebhookEvent.create({ data: { stripeEventId: event.id } });
  } catch {
    // Unique constraint violation = already processed
    return;
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as { metadata?: Record<string, string>; subscription?: string };
      const { companyId, plan } = session.metadata ?? {};
      if (companyId && plan && session.subscription) {
        await prisma.company.update({
          where: { id: companyId },
          data: {
            plan,
            stripeSubscriptionId: String(session.subscription),
            stripeSubscriptionStatus: "active"
          }
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as { metadata?: Record<string, string>; status: string };
      const { companyId, plan } = sub.metadata ?? {};
      if (companyId) {
        await prisma.company.update({
          where: { id: companyId },
          data: {
            stripeSubscriptionStatus: sub.status,
            ...(plan ? { plan } : {})
          }
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as { metadata?: Record<string, string> };
      const { companyId } = sub.metadata ?? {};
      if (companyId) {
        await prisma.company.update({
          where: { id: companyId },
          data: {
            plan: "starter",
            stripeSubscriptionId: null,
            stripeSubscriptionStatus: "canceled"
          }
        });
      }
      break;
    }
  }
}

export async function getSubscriptionInfo(companyId: string) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      plan: true,
      stripeSubscriptionId: true,
      stripeSubscriptionStatus: true,
      stripeCustomerId: true
    }
  });

  if (!company) {
    throw new AppError(404, "Company not found.", "COMPANY_NOT_FOUND");
  }

  const activeStatuses = ["active", "trialing"];
  const isActive = activeStatuses.includes(company.stripeSubscriptionStatus ?? "");
  let nextInvoiceDate: string | null = null;
  let nextInvoiceAmount: number | null = null;

  let cancelAtPeriodEnd = false;
  let cancelAt: string | null = null;

  if (isActive && company.stripeSubscriptionId && env.STRIPE_SECRET_KEY) {
    try {
      const stripe = getStripeClient();
      const sub = await stripe.subscriptions.retrieve(company.stripeSubscriptionId, {
        expand: ["latest_invoice"]
      });
      if (sub.current_period_end) {
        nextInvoiceDate = new Date(sub.current_period_end * 1000).toISOString();
      }
      if (sub.items?.data?.[0]?.price?.unit_amount != null) {
        nextInvoiceAmount = sub.items.data[0].price.unit_amount / 100;
      }
      if (sub.cancel_at_period_end) {
        cancelAtPeriodEnd = true;
        if (sub.cancel_at) {
          cancelAt = new Date(sub.cancel_at * 1000).toISOString();
        } else if (sub.current_period_end) {
          cancelAt = new Date(sub.current_period_end * 1000).toISOString();
        }
      }
    } catch {
      // Non-fatal — fall back to null
    }
  }

  return {
    plan: company.plan,
    subscriptionStatus: company.stripeSubscriptionStatus,
    hasActiveSubscription: isActive,
    hasStripeCustomer: Boolean(company.stripeCustomerId),
    nextInvoiceDate,
    nextInvoiceAmount,
    cancelAtPeriodEnd,
    cancelAt
  };
}

export async function verifyCheckoutSession(sessionId: string, companyId: string) {
  const stripe = getStripeClient();

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"]
  });

  if (!session || session.status !== "complete") {
    return { verified: false };
  }

  const meta = session.metadata as Record<string, string> | null;
  if (meta?.companyId !== companyId) {
    return { verified: false };
  }

  const plan = meta?.plan ?? "starter";
  const sub = session.subscription as { id: string; status: string } | null;

  // Sync subscription to DB as a webhook fallback
  if (sub?.id) {
    await prisma.company.update({
      where: { id: companyId },
      data: {
        plan,
        stripeSubscriptionId: sub.id,
        stripeSubscriptionStatus: sub.status
      }
    });
  }

  return { verified: true, plan };
}
