import type { Request, Response } from "express";
import * as projectsService from "../services/projects.service";
import { asyncHandler } from "../utils/asyncHandler";
import type { ProjectsQuery } from "../validators/projects.validators";

export const listProjects = asyncHandler(async (req: Request, res: Response) => {
  const result = await projectsService.listProjects(req.user!, req.query as unknown as ProjectsQuery);
  res.json(result);
});

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectsService.createProject(req.user!, req.body);
  res.status(201).json({ project });
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectsService.updateProject(req.user!, req.params.id, req.body);
  res.json({ project });
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  await projectsService.deleteProject(req.user!, req.params.id);
  res.status(204).send();
});

export const assignProjectWorkers = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectsService.assignProjectWorkers(req.user!, req.params.id, req.body);
  res.json({ project });
});

export const updateProjectBudget = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectsService.updateProjectBudget(req.user!, req.params.id, req.body.budget);
  res.json({ project });
});

export const getProjectCosting = asyncHandler(async (req: Request, res: Response) => {
  const costing = await projectsService.getProjectCosting(req.user!, req.params.id);
  res.json({ costing });
});
