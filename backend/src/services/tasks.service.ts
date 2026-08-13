import { Prisma, Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import type { AuthContext } from "../types/api";
import { AppError, assertFound } from "../utils/errors";
import { getPagination, toPaginatedResult } from "../utils/pagination";
import type { CreateTaskInput, TasksQuery, UpdateTaskInput } from "../validators/tasks.validators";
import { normalizeOptionalId, requireCompanyProject, requireCompanyWorker } from "./companyScope.service";
import * as pushService from "./push.service";

const taskInclude = {
  worker: {
    select: {
      id: true,
      name: true,
      email: true
    }
  },
  project: {
    select: {
      id: true,
      name: true,
      status: true
    }
  }
} as const;

function getTaskWhere(currentUser: AuthContext, query: TasksQuery): Prisma.TaskWhereInput {
  const where: Prisma.TaskWhereInput = {
    companyId: currentUser.companyId
  };

  if (query.status) {
    where.status = query.status;
  }

  if (query.dateFrom || query.dateTo) {
    where.date = {
      ...(query.dateFrom ? { gte: query.dateFrom } : {}),
      ...(query.dateTo ? { lte: query.dateTo } : {})
    };
  }

  if (currentUser.role === Role.EMPLOYEE) {
    if (!currentUser.workerId) {
      throw new AppError(403, "This account is not linked to a worker profile.", "WORKER_PROFILE_REQUIRED");
    }

    where.workerId = currentUser.workerId;
  }

  return where;
}

export async function listTasks(currentUser: AuthContext, query: TasksQuery) {
  const pagination = getPagination(query);
  const where = getTaskWhere(currentUser, query);

  const [total, tasks] = await prisma.$transaction([
    prisma.task.count({ where }),
    prisma.task.findMany({
      where,
      include: taskInclude,
      orderBy: [{ date: "asc" }, { createdAt: "desc" }],
      skip: pagination.skip,
      take: pagination.take
    })
  ]);

  return toPaginatedResult(tasks, total, query);
}

export async function createTask(currentUser: AuthContext, input: CreateTaskInput) {
  const workerId = normalizeOptionalId(input.workerId);
  const projectId = normalizeOptionalId(input.projectId);

  if (workerId) {
    await requireCompanyWorker(workerId, currentUser.companyId);
  }

  if (projectId) {
    await requireCompanyProject(projectId, currentUser.companyId);
  }

  const task = await prisma.task.create({
    data: {
      title: input.title,
      description: input.description || null,
      date: input.date,
      status: input.status,
      companyId: currentUser.companyId,
      workerId,
      projectId
    },
    include: taskInclude
  });

  if (workerId) {
    const assigneeUserId = await pushService.resolveUserIdForWorker(workerId);
    if (assigneeUserId) {
      void pushService.sendToUser(assigneeUserId, {
        title: "New task assigned",
        body: task.title,
        data: { type: "task", taskId: task.id }
      });
    }
  }

  return task;
}

function assertEmployeeCanUpdate(input: UpdateTaskInput) {
  const allowedKeys = new Set(["status"]);
  const submittedKeys = Object.entries(input)
    .filter(([, value]) => value !== undefined)
    .map(([key]) => key);
  const invalidKeys = submittedKeys.filter((key) => !allowedKeys.has(key));

  if (invalidKeys.length) {
    throw new AppError(403, "Employees can only update their own task status.", "TASK_UPDATE_FORBIDDEN");
  }
}

export async function updateTask(currentUser: AuthContext, taskId: string, input: UpdateTaskInput) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      companyId: currentUser.companyId
    },
    select: {
      id: true,
      workerId: true
    }
  });

  const scopedTask = assertFound(task, "Task was not found in this company.");

  if (currentUser.role === Role.EMPLOYEE) {
    if (!currentUser.workerId || scopedTask.workerId !== currentUser.workerId) {
      throw new AppError(403, "Employees can only update their own tasks.", "TASK_FORBIDDEN");
    }

    assertEmployeeCanUpdate(input);
  }

  const workerId =
    input.workerId === undefined ? undefined : input.workerId === null ? null : normalizeOptionalId(input.workerId);
  const projectId =
    input.projectId === undefined ? undefined : input.projectId === null ? null : normalizeOptionalId(input.projectId);

  if (workerId) {
    await requireCompanyWorker(workerId, currentUser.companyId);
  }

  if (projectId) {
    await requireCompanyProject(projectId, currentUser.companyId);
  }

  const data: Prisma.TaskUpdateInput = {};

  if (input.title !== undefined) data.title = input.title;
  if (input.description !== undefined) data.description = input.description || null;
  if (input.date !== undefined) data.date = input.date;
  if (input.status !== undefined) data.status = input.status;
  if (workerId !== undefined) data.worker = workerId ? { connect: { id: workerId } } : { disconnect: true };
  if (projectId !== undefined) data.project = projectId ? { connect: { id: projectId } } : { disconnect: true };

  return prisma.task.update({
    where: { id: taskId },
    data,
    include: taskInclude
  });
}

export async function deleteTask(currentUser: AuthContext, taskId: string) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      companyId: currentUser.companyId
    },
    select: { id: true }
  });

  assertFound(task, "Task was not found in this company.");

  await prisma.task.delete({
    where: { id: taskId }
  });
}
