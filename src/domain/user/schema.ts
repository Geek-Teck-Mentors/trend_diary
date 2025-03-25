import { z } from 'zod';

export const userSchema = z.object({
  userId: z.string().uuid(),
  accountId: z.string().uuid(),
  displayName: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().optional(),
});

export type UserInput = Pick<z.infer<typeof userSchema>, 'accountId' | 'displayName'>;
export type UserOutput = z.output<typeof userSchema>;
