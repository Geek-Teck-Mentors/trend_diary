import { z } from 'zod'

export const userRoleSchema = z.object({
  userRoleId: z.bigint().positive('userRoleIdは正の整数である必要がある'),
  activeUserId: z.bigint().positive('activeUserIdは正の整数である必要がある'),
  roleId: z.number().int().positive('roleIdは正の整数である必要がある'),
  grantedAt: z.date(),
  grantedBy: z.bigint().positive('grantedByは正の整数である必要がある').nullable(),
  expiresAt: z.date().nullable(),
  revokedAt: z.date().nullable(),
  revokedBy: z.bigint().positive('revokedByは正の整数である必要がある').nullable(),
  note: z.string().max(1024).nullable(),
})

export const userRoleInputSchema = userRoleSchema.pick({
  activeUserId: true,
  roleId: true,
  grantedBy: true,
  expiresAt: true,
  note: true,
})

export const userRoleRevokeSchema = z.object({
  activeUserId: z.bigint().positive('activeUserIdは正の整数である必要がある'),
  roleId: z.number().int().positive('roleIdは正の整数である必要がある'),
  revokedBy: z.bigint().positive('revokedByは正の整数である必要がある'),
})

export type UserRole = z.infer<typeof userRoleSchema>
export type UserRoleInput = z.infer<typeof userRoleInputSchema>
export type UserRoleRevoke = z.infer<typeof userRoleRevokeSchema>
