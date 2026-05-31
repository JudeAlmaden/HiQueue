import { z } from "zod"

export const assignStaffSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  counterId: z.string().min(1, "Counter ID is required"),
  organizationId: z.string().min(1, "Organization ID is required"),
})

export const unassignStaffSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  counterId: z.string().min(1, "Counter ID is required"),
})

export type AssignStaffInput = z.infer<typeof assignStaffSchema>
export type UnassignStaffInput = z.infer<typeof unassignStaffSchema>
