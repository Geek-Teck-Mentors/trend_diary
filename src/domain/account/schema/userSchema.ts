import { z } from 'zod'

export const userSchema = z.object({
  userId: z.bigint().positive(),
  createdAt: z.date(),
})

export const userInputSchema = z.object({
  // Userは作成時に特別な入力は不要（自動生成）
})

export type UserInput = z.infer<typeof userInputSchema>
export type UserOutput = z.output<typeof userSchema>
