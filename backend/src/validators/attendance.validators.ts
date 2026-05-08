import { z } from "zod";

export const attendanceLocationSchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional()
});

export const attendanceQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20)
});

export type AttendanceLocationInput = z.infer<typeof attendanceLocationSchema>;
