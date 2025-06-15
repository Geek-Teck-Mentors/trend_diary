import { z } from 'zod';
import 'zod-openapi/extend';

const baseSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
});

export default baseSchema;
