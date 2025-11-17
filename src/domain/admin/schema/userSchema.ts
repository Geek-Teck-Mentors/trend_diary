import { z } from 'zod'
import { createdAt } from '@/common/schemas'

export const userSchema = z.object({
  activeUserId: z.bigint().positive('activeUserIdは正の整数である必要があります'),
  email: z.string().email('有効なメールアドレスである必要があります'),
  displayName: z.string().nullable(),
  hasAdminAccess: z.boolean(),
  grantedAt: z.date().nullable(),
  grantedByAdminUserId: z.number().int().positive().nullable(),
  createdAt,
})

export type User = z.infer<typeof userSchema>
