import { z } from 'zod'

export const userRoleSchema = z.object({
  activeUserId: z.bigint().positive('activeUserIdは正の整数である必要がある'),
  roleId: z.number().int().positive('roleIdは正の整数である必要がある'),
  grantedAt: z.date(),
})

export const userRoleInputSchema = userRoleSchema.pick({
  activeUserId: true,
  roleId: true,
})

export const userRoleRevokeSchema = userRoleSchema.pick({
  activeUserId: true,
  roleId: true,
})

export type UserRole = z.infer<typeof userRoleSchema>
export type UserRoleInput = z.infer<typeof userRoleInputSchema>
export type UserRoleRevoke = z.infer<typeof userRoleRevokeSchema>
