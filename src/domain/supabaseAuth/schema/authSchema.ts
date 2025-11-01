import { z } from 'zod'

export const authInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export type AuthInput = z.infer<typeof authInputSchema>
