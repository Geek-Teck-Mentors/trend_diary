import { z } from 'zod'

export const adminUserSchema = z.object({
  adminUserId: z.number().int().positive('adminUserIdは正の整数である必要があります'),
  activeUserId: z.bigint().positive('activeUserIdは正の整数である必要があります'),
  grantedAt: z.date(),
  grantedByAdminUserId: z
    .number()
    .int()
    .positive('grantedByAdminUserIdは正の整数である必要があります'),
})

export const adminUserInputSchema = adminUserSchema.pick({
  activeUserId: true,
  grantedByAdminUserId: true,
})

export type AdminUserInput = z.infer<typeof adminUserInputSchema>
