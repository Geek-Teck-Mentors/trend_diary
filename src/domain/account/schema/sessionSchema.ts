import { z } from 'zod'

export const sessionSchema = z.object({
  sessionId: z.string().min(1).max(255),
  activeUserId: z.bigint().positive(),
  sessionToken: z.string().max(255).optional().nullable(),
  expiresAt: z.date(),
  ipAddress: z.string().max(45).optional().nullable(), // IPv4(15文字)とIPv6(39文字)対応
  userAgent: z.string().max(255).optional().nullable(),
  createdAt: z.date(),
})

export const sessionInputSchema = z.object({
  sessionId: z.string().min(1).max(255),
  activeUserId: z.bigint().positive(),
  sessionToken: z.string().max(255).optional().nullable(),
  expiresAt: z.date(),
  ipAddress: z.string().max(45).optional().nullable(),
  userAgent: z.string().max(255).optional().nullable(),
})

export const sessionUpdateSchema = z.object({
  sessionToken: z.string().max(255).optional().nullable(),
  expiresAt: z.date().optional(),
  ipAddress: z.string().max(45).optional().nullable(),
  userAgent: z.string().max(255).optional().nullable(),
})

export type SessionInput = z.infer<typeof sessionInputSchema>
export type SessionUpdate = z.infer<typeof sessionUpdateSchema>
export type SessionOutput = z.output<typeof sessionSchema>