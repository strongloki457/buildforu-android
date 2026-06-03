import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../config/prisma";

export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  const { userId, companyId, role, workerId } = req.user!;
  const notifications: { id: string; title: string; time: string; type: string }[] = [];
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  if (role === "ADMIN") {
    const [pendingMaterials, completedTasks, onSiteCount] = await Promise.all([
      prisma.materialRequest.count({ where: { companyId, status: "PENDING" } }),
      prisma.task.count({ where: { companyId, status: "DONE", updatedAt: { gte: oneDayAgo } } }),
      prisma.attendance.count({ where: { companyId, endTime: null } })
    ]);

    if (pendingMaterials > 0) {
      notifications.push({
        id: "n-pending-materials",
        title: `${pendingMaterials} material request${pendingMaterials > 1 ? "s" : ""} pending approval`,
        time: "Today",
        type: "material",
        link: "/materials"
      });
    }

    if (completedTasks > 0) {
      notifications.push({
        id: "n-completed-tasks",
        title: `${completedTasks} task${completedTasks > 1 ? "s" : ""} completed today`,
        time: "Today",
        type: "task",
        link: "/calendar"
      });
    }

    if (onSiteCount > 0) {
      notifications.push({
        id: "n-on-site",
        title: `${onSiteCount} worker${onSiteCount > 1 ? "s" : ""} currently on site`,
        time: "Now",
        type: "attendance",
        link: "/attendance-reports"
      });
    }
  } else if (workerId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [dueTasks, updatedRequests] = await Promise.all([
      prisma.task.count({
        where: { companyId, workerId, status: { not: "DONE" }, date: { gte: today, lt: tomorrow } }
      }),
      prisma.materialRequest.count({
        where: {
          companyId,
          requesterWorkerId: workerId,
          status: { in: ["ORDERED", "PURCHASED", "REJECTED"] },
          updatedAt: { gte: oneDayAgo }
        }
      })
    ]);

    if (dueTasks > 0) {
      notifications.push({
        id: "n-due-tasks",
        title: `${dueTasks} task${dueTasks > 1 ? "s" : ""} due today`,
        time: "Today",
        type: "task",
        link: "/calendar"
      });
    }

    if (updatedRequests > 0) {
      notifications.push({
        id: "n-material-updates",
        title: `${updatedRequests} material request${updatedRequests > 1 ? "s" : ""} updated`,
        time: "Today",
        type: "material",
        link: "/materials"
      });
    }
  }

  res.json({ notifications });
});
