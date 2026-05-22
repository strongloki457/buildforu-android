import { apiRequest } from "./client";

export function createCheckoutSession(plan) {
  return apiRequest("/api/stripe/create-checkout-session", {
    method: "POST",
    body: { plan }
  });
}

export function createPortalSession() {
  return apiRequest("/api/stripe/portal", { method: "POST" });
}

export function getSubscription() {
  return apiRequest("/api/stripe/subscription");
}

export function verifyCheckoutSession(sessionId) {
  return apiRequest(`/api/stripe/verify-session?session_id=${encodeURIComponent(sessionId)}`);
}
