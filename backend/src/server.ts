import fs from "fs";
import https from "https";
import path from "path";
import app from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";

let server: ReturnType<typeof app.listen> | https.Server | null = null;

function loadDevSslCert(): { key: string; cert: string } | null {
  try {
    const pemPath = path.resolve(__dirname, "../../node_modules/.vite/basic-ssl/_cert.pem");
    if (!fs.existsSync(pemPath)) return null;
    const pem = fs.readFileSync(pemPath, "utf8");
    const keyMatch = pem.match(/-----BEGIN RSA PRIVATE KEY-----[\s\S]*?-----END RSA PRIVATE KEY-----/);
    const certMatch = pem.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/);
    if (!keyMatch || !certMatch) return null;
    return { key: keyMatch[0], cert: certMatch[0] };
  } catch {
    return null;
  }
}

async function startServer() {
  try {
    await prisma.$connect();
    process.stdout.write("Prisma connected to BuildForU database\n");

    const ssl = env.NODE_ENV !== "production" ? loadDevSslCert() : null;

    if (ssl) {
      server = https.createServer(ssl, app).listen(env.PORT, () => {
        process.stdout.write(`BuildForU backend listening on https port ${env.PORT}\n`);
      });
    } else {
      server = app.listen(env.PORT, () => {
        process.stdout.write(`BuildForU backend listening on port ${env.PORT}\n`);
      });
    }

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
