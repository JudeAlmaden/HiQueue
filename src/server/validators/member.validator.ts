import { z } from "zod"

export const createMemberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
  email: z.string().trim().toLowerCase().email("Email must be a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100, "Password must be less than 100 characters"),
  role: z.enum(["owner", "admin", "staff"], { errorMap: () => ({ message: "Role must be owner, admin, or staff" }) }),
  organizationId: z.string().min(1, "Organization ID is required"),
})

export const updateMemberSchema = z.object({
  id: z.string().min(1, "Member ID is required"),
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters").optional(),
  email: z.string().trim().toLowerCase().email("Email must be a valid email address").optional(),
  role: z.enum(["owner", "admin", "staff"], { errorMap: () => ({ message: "Role must be owner, admin, or staff" }) }).optional(),
})

export const deleteMemberSchema = z.object({
  id: z.string().min(1, "Member ID is required"),
  organizationId: z.string().min(1, "Organization ID is required"),
})

export type CreateMemberInput = z.infer<typeof createMemberSchema>
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>
export type DeleteMemberInput = z.infer<typeof deleteMemberSchema>
