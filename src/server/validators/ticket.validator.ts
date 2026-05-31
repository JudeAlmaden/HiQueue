import { z } from "zod"

export const createTicketSchema = z.object({
  queueId: z.string().min(1, "Queue ID is required"),
  serviceId: z.string().min(1, "Service ID is required"),
  customerName: z.string().max(100, "Name must be less than 100 characters").optional().nullable(),
})

export type CreateTicketInput = z.infer<typeof createTicketSchema>
