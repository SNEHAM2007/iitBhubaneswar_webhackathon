import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),

  email: z.string().trim().email().toLowerCase(),

  password: z.string().min(6).max(72),

  role: z.enum(["FACULTY", "COORDINATOR", "CLUB_REP", "ADMIN"]).optional(),

  departmentCode: z.string().trim().optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),

  password: z.string().min(1),
});
