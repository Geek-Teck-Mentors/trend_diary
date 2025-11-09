import { z } from 'zod'

export const authInputSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, 'パスワードは8文字以上必要です')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      'パスワードは英大文字・小文字・数字・記号(@$!%*?&)を含める必要があります',
    ),
})

export type AuthInput = z.infer<typeof authInputSchema>
