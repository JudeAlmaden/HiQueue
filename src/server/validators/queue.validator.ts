import { z } from "zod"

export const createQueueSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional().or(z.literal("")),
  passcode: z.string().min(4, "Passcode must be at least 4 characters").max(20, "Passcode must be less than 20 characters").optional().or(z.literal("")),
  organizationId: z.string().min(1, "Organization ID is required"),
})

export const updateQueueSchema = z.object({
  id: z.string().min(1, "Queue ID is required"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters").optional(),
  description: z.string().max(500, "Description must be less than 500 characters").nullable().optional().or(z.literal("")),
  passcode: z.string().min(4, "Passcode must be at least 4 characters").max(20, "Passcode must be less than 20 characters").nullable().optional().or(z.literal("")),
  theme: z.record(z.any()).optional(),
  layout: z.record(z.any()).optional(),
})

export const deleteQueueSchema = z.object({
  id: z.string().min(1, "Queue ID is required"),
})

export type CreateQueueInput = z.infer<typeof createQueueSchema>
export type UpdateQueueInput = z.infer<typeof updateQueueSchema>
export type DeleteQueueInput = z.infer<typeof deleteQueueSchema>
