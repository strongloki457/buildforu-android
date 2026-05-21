import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { env, getAllowedOrigins } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import { AppError } from "./utils/errors";
import attendanceRoutes from "./routes/attendance.routes";
import authRoutes from "./routes/auth.routes";
import chatRoutes from "./routes/chat.routes";
import materialsRoutes from "./routes/materials.routes";
import notificationsRoutes from "./routes/notifications.routes";
import projectsRoutes from "./routes/projects.routes";
import tasksRoutes from "./routes/tasks.routes";
import aiRoutes from "./routes/ai.routes";
import workersRoutes from "./routes/workers.routes";

const allowedOrigins = new Set(getAllowedOrigins());
const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin) {
        callback(null, env.NODE_ENV !== "production");
        return;
      }

      const isLocalDevelopmentOrigin =
        env.NODE_ENV !== "production" &&
        /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(origin);

      if (allowedOrigins.has(origin) || isLocalDevelopmentOrigin) {
        callback(null, true);
        return;
      }

      callback(new AppError(403, "CORS origin is not allowed.", "CORS_NOT_ALLOWED"));
    }
  })
);
app.use(express.json({ limit: "1mb" }));

app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
      error: {
        code: "RATE_LIMITED",
        message: "Too many requests. Please try again later."
      }
    }
  })
);

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "buildforu-backend"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/workers", workersRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/materials", materialsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
