import { z } from "zod"
import { sanitizeString, sanitizeEmail, validatePasswordStrength, isCommonPassword } from "@/server/lib/sanitize"

// Custom Zod transforms for sanitization
const sanitizedString = (maxLength: number = 1000) =>
  z.string().transform(val => sanitizeString(val, maxLength))

const sanitizedEmail = z.string().transform(val => sanitizeEmail(val))

// Custom password validator
const securePassword = z.string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must be less than 100 characters")
  .refine((password) => {
    const strength = validatePasswordStrength(password)
    return strength.isValid
  }, {
    message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  })
  .refine((password) => {
    return !isCommonPassword(password)
  }, {
    message: "Password is too common. Please choose a stronger password"
  })

export const createMemberSchema = z.object({
  name: sanitizedString(50).pipe(
    z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters")
  ),
  email: sanitizedEmail.pipe(
    z.string().email("Email must be a valid email address")
  ),
  password: securePassword,
  role: z.enum(["admin", "staff"], { message: "Role must be admin or staff" }),
  organizationId: z.string().min(1, "Organization ID is required"),
})

export const updateMemberSchema = z.object({
  id: z.string().min(1, "Member ID is required"),
  name: sanitizedString(50).pipe(
    z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters")
  ).optional(),
  email: sanitizedEmail.pipe(
    z.string().email("Email must be a valid email address")
  ).optional(),
  role: z.enum(["admin", "staff"], { message: "Role must be admin or staff" }).optional(),
})

export const deleteMemberSchema = z.object({
  id: z.string().min(1, "Member ID is required"),
  organizationId: z.string().min(1, "Organization ID is required"),
})

export type CreateMemberInput = z.infer<typeof createMemberSchema>
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>
export type DeleteMemberInput = z.infer<typeof deleteMemberSchema>
