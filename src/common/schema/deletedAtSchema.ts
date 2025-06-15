import { z } from 'zod';
import 'zod-openapi/extend';

const deletedAtSchema = z.object({
  deletedAt: z.date().optional(),
});

export default deletedAtSchema;
