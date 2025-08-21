import { z } from 'zod'
import { userSchema } from './userSchema'

export const userListResultSchema = z.object({
  users: z.array(userSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
})

export type UserListResult = z.infer<typeof userListResultSchema>
