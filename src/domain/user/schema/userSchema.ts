import { z } from 'zod'

export const userSchema = z.object({
  userId: z.bigint(),
  supabaseId: z.string().uuid(),
  createdAt: z.date(),
})

export type User = z.infer<typeof userSchema>
