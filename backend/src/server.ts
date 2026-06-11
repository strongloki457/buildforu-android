import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app";
import { env, getAllowedOrigins } from "./config/env";
import { prisma } from "./config/prisma";
import { autoCloseExpiredSessions } from "./services/attendance.service";
import { verifyAccessToken } from "./utils/jwt";

export let io: SocketIOServer | null = null;

const AUTO_CLOSE_INTERVAL_MS = 15 * 60 * 1000;

let httpServer: ReturnType<typeof createServer> | null = null;
let autoCloseTimer: ReturnType<typeof setInterval> | null = null;

async function runAutoClose() {
  try {
    const closed = await autoCloseExpiredSessions();
    if (closed > 0) {
      process.stdout.write(`[attendance] Auto-closed ${closed} session(s) exceeding 14h.\n`);
    }
  } catch (error) {
    process.stderr.write(`[attendance] Auto-close failed: ${error instanceof Error ? error.message : String(error)}\n`);
  }
}

async function startServer() {
  try {
    await prisma.$connect();
    process.stdout.write("Prisma connected to BuildForU database\n");

    await runAutoClose();
    autoCloseTimer = setInterval(() => { void runAutoClose(); }, AUTO_CLOSE_INTERVAL_MS);

    httpServer = createServer(app);

    const allowedOrigins = new Set(getAllowedOrigins());
    io = new SocketIOServer(httpServer, {
      cors: {
        origin(origin, callback) {
          if (!origin) { callback(null, true); return; }
          const isLocal =
            env.NODE_ENV !== "production" &&
            /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
          if (allowedOrigins.has(origin) || isLocal) {
            callback(null, true);
          } else {
            callback(new Error("Socket.IO CORS not allowed"));
          }
        },
        credentials: true
      }
    });

    io.use(async (socket, next) => {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) { next(new Error("Authentication required")); return; }
      try {
        const payload = verifyAccessToken(token);
        const membership = await prisma.userCompany.findUnique({
          where: {
            userId_companyId: {
              userId: payload.userId,
              companyId: payload.companyId
            }
          },
          select: { id: true }
        });
        if (!membership) { next(new Error("User not found")); return; }
        (socket as typeof socket & { companyId: string; userId: string }).companyId = payload.companyId;
        (socket as typeof socket & { companyId: string; userId: string }).userId = payload.userId;
        next();
      } catch {
        next(new Error("Invalid token"));
      }
    });

    io.on("connection", (socket) => {
      const { companyId, userId } = socket as typeof socket & { companyId: string; userId: string };
      void socket.join(`company:${companyId}`);
      void socket.join(`user:${userId}`);
      socket.on("disconnect", () => {});
    });

    httpServer.setTimeout(30_000);
    (httpServer as typeof httpServer & { headersTimeout?: number; keepAliveTimeout?: number }).headersTimeout = 35_000;
    (httpServer as typeof httpServer & { headersTimeout?: number; keepAliveTimeout?: number }).keepAliveTimeout = 65_000;

    httpServer.listen(env.PORT, () => {
      process.stdout.write(`BuildForU backend listening on port ${env.PORT}\n`);
    });

    httpServer.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        process.stderr.write(`Port ${env.PORT} is already in use.\n`);
        process.exit(1);
      }
      process.stderr.write(`${error.message}\n`);
      process.exit(1);
    });
  } catch (error) {
    process.stderr.write(`Failed to start BuildForU backend: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  }
}

function shutdown(signal: string) {
  process.stdout.write(`${signal} received. Shutting down backend...\n`);
  if (autoCloseTimer) clearInterval(autoCloseTimer);
  const finishShutdown = async () => {
    await prisma.$disconnect();
    process.exit(0);
  };

  if (!httpServer) {
    void finishShutdown();
    return;
  }

  httpServer.close(() => { void finishShutdown(); });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

void startServer();
