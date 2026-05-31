import { z } from "zod"

export const createOrganizationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
})

export const updateOrganizationSchema = z.object({
  id: z.string().min(1, "Organization ID is required"),
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
})

export const deleteOrganizationSchema = z.object({
  id: z.string().min(1, "Organization ID is required"),
})

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>
export type DeleteOrganizationInput = z.infer<typeof deleteOrganizationSchema>
