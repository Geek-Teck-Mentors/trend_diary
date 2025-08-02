import { z } from 'zod'

export const activeUserSchema = z.object({
  activeUserId: z.bigint().positive(),
  userId: z.bigint().positive(),
  email: z.string().email().max(320), // RFC 5322の最大長
  password: z.string().min(8).max(50),
  displayName: z.string().max(64).optional().nullable(), // オプションで最大長64文字
  lastLogin: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
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

export type ActiveUserInput = z.infer<typeof activeUserInputSchema>
