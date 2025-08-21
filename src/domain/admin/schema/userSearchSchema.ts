import { z } from 'zod'

export const userSearchQuerySchema = z.object({
  searchQuery: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
})

export type UserSearchQuery = z.infer<typeof userSearchQuerySchema>
