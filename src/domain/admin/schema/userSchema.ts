import { z } from 'zod'

export const userSchema = z.object({
  activeUserId: z.bigint().positive('activeUserIdは正の整数である必要があります'),
  email: z.string().email('有効なメールアドレスである必要があります'),
  displayName: z.string().nullable(),
  isAdmin: z.boolean(),
  grantedAt: z.date().nullable(),
  grantedByAdminUserId: z.number().int().positive().nullable(),
  createdAt: z.date(),
})

export type User = z.infer<typeof userSchema>
