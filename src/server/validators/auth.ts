import { z } from "zod"

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(50, "Name must be less than 50 characters.")
    .trim(),
  email: z
    .string()
    .email("Please enter a valid email address.")
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(100, "Password is too long."),
})

export const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address.")
    .trim()
    .toLowerCase(),
  password: z.string().min(1, "Password is required."),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
