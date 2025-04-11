import { z } from 'zod';
import { baseSchema } from '@/common/baseSchema';

export const userSchema = z
  .object({
    userId: z.bigint(),
    accountId: z.bigint(),
    displayName: z.string().optional(),
  })
  .merge(baseSchema);

export type UserInput = Pick<z.infer<typeof userSchema>, 'accountId' | 'displayName'>;
export type UserOutput = z.output<typeof userSchema>;
