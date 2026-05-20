import type { Request, Response } from "express";
import * as attendanceService from "../services/attendance.service";
import type { PaginationQuery } from "../types/api";
import { asyncHandler } from "../utils/asyncHandler";

export const startAttendance = asyncHandler(async (req: Request, res: Response) => {
  const attendance = await attendanceService.startAttendance(req.user!, req.body);
  res.status(201).json({ attendance });
});

export const endAttendance = asyncHandler(async (req: Request, res: Response) => {
  const attendance = await attendanceService.endAttendance(req.user!, req.body);
  res.json({ attendance });
});

export const listAttendance = asyncHandler(async (req: Request, res: Response) => {
  const result = await attendanceService.listAttendance(req.user!, req.query as unknown as PaginationQuery);
  res.json(result);
});

export const recordLocationPoint = asyncHandler(async (req: Request, res: Response) => {
  const locationPoint = await attendanceService.recordLocationPoint(req.user!, req.body);
  res.status(201).json({ locationPoint });
});

export const listAttendanceLocations = asyncHandler(async (req: Request, res: Response) => {
  const locationPoints = await attendanceService.listAttendanceLocations(req.user!, req.params.id);
  res.json({ locationPoints });
});
