import { z } from 'zod';

export const accountSchema = z.object({
  accountId: z.string().uuid(),
  email: z.string().email(),
  password: z.string().min(8).max(50),
  lastLogin: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

export type AccountInput = Pick<z.infer<typeof accountSchema>, 'email' | 'password'>;
export type AccountOutput = z.output<typeof accountSchema>;
