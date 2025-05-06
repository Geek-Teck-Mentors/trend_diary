import { z } from 'zod';

const baseSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
});

export default baseSchema;
