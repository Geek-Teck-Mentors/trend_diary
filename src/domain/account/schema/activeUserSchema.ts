import { z } from 'zod'

export const activeUserSchema = z.object({
  activeUserId: z.bigint().positive(),
  userId: z.bigint().positive(),
  email: z.string().email().max(1024),
  password: z.string().min(8).max(1024),
  displayName: z.string().max(1024).optional().nullable(),
  lastLogin: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const activeUserInputSchema = z.object({
  email: z.string().email().max(1024),
  password: z.string().min(8).max(1024),
  displayName: z.string().max(1024).optional().nullable(),
})

export const activeUserUpdateSchema = z.object({
  displayName: z.string().max(1024).optional().nullable(),
  password: z.string().min(8).max(1024).optional(),
})

export type ActiveUserInput = z.infer<typeof activeUserInputSchema>
export type ActiveUserUpdate = z.infer<typeof activeUserUpdateSchema>
export type ActiveUserOutput = z.output<typeof activeUserSchema>