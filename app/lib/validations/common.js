import { z } from "zod";
import { REGEX } from "../validation";

export const emailSchema = z
  .string({ required_error: "Email is required" })
  .trim()
  .email("Invalid email format")
  .regex(REGEX.EMAIL, "Invalid email format");

export const phoneSchema = z
  .string({ required_error: "Phone number is required" })
  .trim()
  .regex(REGEX.PHONE, "Invalid phone number format. Use international format (e.g., +91...)");

export const passwordSchema = z
  .string({ required_error: "Password is required" })
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password too long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");


export const nameSchema = z
  .string({ required_error: "Name is required" })
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name too long");

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
});
