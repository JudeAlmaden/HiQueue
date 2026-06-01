import { z } from "zod"

export const createServiceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  prefix: z.string().regex(/^[A-Z]{1,2}$/, "Prefix must be 1 to 2 uppercase letters (A-Z)"),
  avgDurationMinutes: z.number().int().min(1, "Average duration must be at least 1 minute").max(480, "Average duration must be less than 480 minutes").optional().nullable(),
  queueId: z.string().min(1, "Queue ID is required"),
})

export const updateServiceSchema = z.object({
  id: z.string().min(1, "Service ID is required"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters").optional(),
  prefix: z.string().regex(/^[A-Z]{1,2}$/, "Prefix must be 1 to 2 uppercase letters (A-Z)").optional(),
  avgDurationMinutes: z.number().int().min(1, "Average duration must be at least 1 minute").max(480, "Average duration must be less than 480 minutes").optional().nullable(),
})

export const deleteServiceSchema = z.object({
  id: z.string().min(1, "Service ID is required"),
})

export const setServiceActiveSchema = z.object({
  id: z.string().min(1, "Service ID is required"),
  isActive: z.boolean(),
  organizationId: z.string().min(1, "Organization ID is required"),
  orgSlug: z.string().min(1, "Organization slug is required"),
  queueId: z.string().min(1, "Queue ID is required"),
})

export type CreateServiceInput = z.infer<typeof createServiceSchema>
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>
export type DeleteServiceInput = z.infer<typeof deleteServiceSchema>
export type SetServiceActiveInput = z.infer<typeof setServiceActiveSchema>
