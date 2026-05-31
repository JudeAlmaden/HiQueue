import { z } from "zod"

export const createCounterSchema = z.object({
  name: z.string().min(1, "Name must be at least 1 character").max(50, "Name must be less than 50 characters"),
  queueId: z.string().min(1, "Queue ID is required"),
  serviceIds: z.array(z.string()).optional().default([]),
})

export const updateCounterSchema = z.object({
  id: z.string().min(1, "Counter ID is required"),
  name: z.string().min(1, "Name must be at least 1 character").max(50, "Name must be less than 50 characters"),
  serviceIds: z.array(z.string()).optional().default([]),
})

export const deleteCounterSchema = z.object({
  id: z.string().min(1, "Counter ID is required"),
})

export type CreateCounterInput = z.infer<typeof createCounterSchema>
export type UpdateCounterInput = z.infer<typeof updateCounterSchema>
export type DeleteCounterInput = z.infer<typeof deleteCounterSchema>
