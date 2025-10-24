import { z } from 'zod'

export const authInputSchema = z.object({
  email: z.string().email().max(320), // RFC 5322の最大長
  password: z.string().min(8).max(50),
})

export type AuthInput = z.infer<typeof authInputSchema>
