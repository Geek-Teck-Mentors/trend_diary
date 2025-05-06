import { z } from 'zod';

const deletedAtSchema = z.object({
  deletedAt: z.date().optional(),
});

export default deletedAtSchema;
