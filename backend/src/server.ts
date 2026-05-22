import app from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";
import { autoCloseExpiredSessions } from "./services/attendance.service";

const AUTO_CLOSE_INTERVAL_MS = 15 * 60 * 1000;

let server: ReturnType<typeof app.listen> | null = null;
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

    server = app.listen(env.PORT, () => {
      process.stdout.write(`BuildForU backend listening on port ${env.PORT}\n`);
    });

    server.setTimeout(30_000);
    (server as ReturnType<typeof app.listen> & { headersTimeout?: number; keepAliveTimeout?: number }).headersTimeout = 35_000;
    (server as ReturnType<typeof app.listen> & { headersTimeout?: number; keepAliveTimeout?: number }).keepAliveTimeout = 65_000;

    server.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        process.stderr.write(`Port ${env.PORT} is already in use. Stop the other API server or change PORT.\n`);
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

  if (!server) {
    void finishShutdown();
    return;
  }

  server.close(() => {
    void finishShutdown();
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

void startServer();
