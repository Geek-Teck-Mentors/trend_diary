import { z } from 'zod'
import { createdAt, updatedAt } from '@/common/schemas'

export const activeUserSchema = z.object({
  activeUserId: z.bigint().positive(),
  userId: z.bigint().positive(),
  email: z.string().email().max(320), // RFC 5322の最大長
  password: z.string().min(8).max(50),
  displayName: z.string().max(64).optional().nullable(), // オプションで最大長64文字
  authenticationId: z.string().uuid().optional().nullable(), // Supabase AuthenticationユーザーID
  lastLogin: z.date().optional(),
  createdAt,
  updatedAt,
  adminUserId: z.number().positive().nullable().default(null),
})

export const activeUserInputSchema = activeUserSchema.pick({
  email: true,
  password: true,
  displayName: true,
})

export const activeUserUpdateSchema = activeUserSchema.pick({
  displayName: true,
  password: true,
})

export type ActiveUser = z.infer<typeof activeUserSchema>
export type ActiveUserInput = z.infer<typeof activeUserInputSchema>
