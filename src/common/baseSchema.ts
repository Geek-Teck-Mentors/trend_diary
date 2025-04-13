import { z } from 'zod';

export const baseSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const deletedAtSchema = z.object({
  deletedAt: z.date().optional(),
});
