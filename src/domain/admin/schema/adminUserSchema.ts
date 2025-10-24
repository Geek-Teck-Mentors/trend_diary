import { z } from 'zod'

export const adminUserSchema = z.object({
  adminUserId: z.number().int().positive('adminUserIdは正の整数である必要があります'),
  userId: z.bigint().positive('userIdは正の整数である必要があります'), // userId から userId に変更
  grantedAt: z.date(),
  grantedByAdminUserId: z
    .number()
    .int()
    .positive('grantedByAdminUserIdは正の整数である必要があります'),
})

export const adminUserInputSchema = adminUserSchema.pick({
  userId: true, // userId から userId に変更
  grantedByAdminUserId: true,
})

export type AdminUser = z.infer<typeof adminUserSchema>
export type AdminUserInput = z.infer<typeof adminUserInputSchema>
