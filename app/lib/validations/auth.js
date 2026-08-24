import { z } from "zod";
import { emailSchema, passwordSchema, nameSchema, phoneSchema } from "./common";

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema,
  role: z.enum(["user", "partner"]).optional().default("user"),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const resetPasswordRequestSchema = z.object({
  email: emailSchema,
});

export const resetPasswordConfirmSchema = z.object({
  email: emailSchema,
  otp: z.string().length(6, "OTP must be 6 digits"),
  newPassword: passwordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
});


export const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian phone number").optional(),
});
