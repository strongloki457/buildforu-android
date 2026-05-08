import app from "./app";
import { env } from "./config/env";

const server = app.listen(env.PORT, () => {
  process.stdout.write(`BuildForU backend listening on port ${env.PORT}\n`);
});

function shutdown(signal: string) {
  process.stdout.write(`${signal} received. Shutting down backend...\n`);
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
