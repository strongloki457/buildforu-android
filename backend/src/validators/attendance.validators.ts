import { z } from "zod";

export const attendanceLocationSchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional()
});

const CLOCK_DRIFT_TOLERANCE_MS = 5 * 60 * 1000;

export const attendanceLocationPointSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  accuracy: z.coerce.number().nonnegative().optional(),
  recordedAt: z.coerce
    .date()
    .refine((date) => date.getTime() <= Date.now() + CLOCK_DRIFT_TOLERANCE_MS, {
      message: "recordedAt cannot be in the future"
    })
    .optional()
});

export const attendanceQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20)
});

export type AttendanceLocationInput = z.infer<typeof attendanceLocationSchema>;
export type AttendanceLocationPointInput = z.infer<typeof attendanceLocationPointSchema>;
