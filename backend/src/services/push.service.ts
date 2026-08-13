import { cert, initializeApp, type App } from "firebase-admin/app";
import { getMessaging, type SendResponse } from "firebase-admin/messaging";
import { prisma } from "../config/prisma";
import { env } from "../config/env";

let app: App | null | undefined;

function getFirebaseApp() {
  if (app !== undefined) return app;

  if (!env.FIREBASE_SERVICE_ACCOUNT) {
    console.warn("FIREBASE_SERVICE_ACCOUNT not configured — push notifications are disabled.");
    app = null;
    return app;
  }

  try {
    const serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT);
    app = initializeApp({ credential: cert(serviceAccount) });
  } catch (error) {
    console.warn("Failed to initialize Firebase Admin SDK — push notifications are disabled.", error);
    app = null;
  }

  return app;
}

export async function registerPushToken(userId: string, token: string, platform: string) {
  await prisma.pushToken.upsert({
    where: { token },
    update: { userId, platform },
    create: { userId, token, platform }
  });
}

export async function unregisterPushToken(token: string) {
  await prisma.pushToken.deleteMany({ where: { token } });
}

export async function resolveUserIdForWorker(workerId: string): Promise<string | null> {
  const membership = await prisma.userCompany.findFirst({
    where: { workerId },
    select: { userId: true }
  });

  return membership?.userId ?? null;
}

interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

function isUnregisteredError(error: { code?: string } | undefined) {
  return (
    error?.code === "messaging/registration-token-not-registered" ||
    error?.code === "messaging/invalid-registration-token"
  );
}

// Best-effort: a push failure (missing config, dead token, network hiccup) must never
// fail the operation that triggered it (sending a chat message, creating a task, ...).
export async function sendToUser(userId: string, payload: PushPayload) {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return;

  const tokens = await prisma.pushToken.findMany({ where: { userId }, select: { token: true } });
  if (!tokens.length) return;

  try {
    const response = await getMessaging(firebaseApp).sendEachForMulticast({
      tokens: tokens.map((t) => t.token),
      notification: { title: payload.title, body: payload.body },
      data: payload.data ?? {}
    });

    const deadTokens = response.responses
      .map((result: SendResponse, index: number) =>
        !result.success && isUnregisteredError(result.error) ? tokens[index].token : null
      )
      .filter((token: string | null): token is string => Boolean(token));

    if (deadTokens.length) {
      await prisma.pushToken.deleteMany({ where: { token: { in: deadTokens } } });
    }
  } catch (error) {
    console.warn("Push notification send failed.", error);
  }
}
