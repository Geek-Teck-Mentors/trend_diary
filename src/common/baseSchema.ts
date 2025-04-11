import { z } from 'zod';

export const baseSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().optional(),
});

export type TimestampFields = z.infer<typeof baseSchema>;
