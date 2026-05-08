import type { Request, Response } from "express";
import * as tasksService from "../services/tasks.service";
import type { TasksQuery } from "../validators/tasks.validators";
import { asyncHandler } from "../utils/asyncHandler";

export const listTasks = asyncHandler(async (req: Request, res: Response) => {
  const result = await tasksService.listTasks(req.user!, req.query as unknown as TasksQuery);
  res.json(result);
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await tasksService.createTask(req.user!, req.body);
  res.status(201).json({ task });
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await tasksService.updateTask(req.user!, req.params.id, req.body);
  res.json({ task });
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  await tasksService.deleteTask(req.user!, req.params.id);
  res.status(204).send();
});
