import { z } from 'zod';

const mediaEnum = z.enum(['qiita', 'zenn']);
const readStatusEnum = z.enum(['0', '1']);

export const articleQuerySchema = z.object({
  title: z.string().optional(),
  author: z.string().optional(),
  media: mediaEnum.optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  read_status: readStatusEnum.optional(),
});

export type ArticleQueryParams = z.infer<typeof articleQuerySchema>;