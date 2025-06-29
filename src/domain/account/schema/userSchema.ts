import { z } from 'zod'
import baseSchema from '@/common/schema/baseSchema'
import deletedAtSchema from '@/common/schema/deletedAtSchema'

export const userSchema = z
  .object({
    userId: z.bigint(),
    accountId: z.bigint(),
    displayName: z.string().optional(),
  })
  .merge(baseSchema)
  .merge(deletedAtSchema)

export type UserInput = Pick<z.infer<typeof userSchema>, 'accountId' | 'displayName'>
export type UserOutput = z.output<typeof userSchema>
