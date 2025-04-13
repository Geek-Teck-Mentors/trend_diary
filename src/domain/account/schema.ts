import { z } from 'zod';
import { baseSchema, deletedAtSchema } from '@/common/baseSchema';

export const accountSchema = z
  .object({
    accountId: z.bigint(),
    email: z.string().email(),
    password: z.string().min(8).max(50),
    lastLogin: z.date().optional(),
  })
  .merge(baseSchema)
  .merge(deletedAtSchema);

export type AccountInput = Pick<z.infer<typeof accountSchema>, 'email' | 'password'>;
export type AccountOutput = z.output<typeof accountSchema>;
