import { z } from 'zod';

export const userSchema = z.object({
  userId: z.bigint(),
  accountId: z.bigint(),
  displayName: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.date().optional(),
});

export type UserInput = Pick<z.infer<typeof userSchema>, 'accountId' | 'displayName'>;
export type UserOutput = z.output<typeof userSchema>;
