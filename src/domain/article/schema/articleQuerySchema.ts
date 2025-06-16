import { z } from 'zod';
import { cursorPaginationSchema } from '@/common/pagination';

const mediaEnum = z.enum(['qiita', 'zenn']);
const readStatusEnum = z.enum(['0', '1']);

const articleSearchSchema = z.object({
  title: z.string().optional(),
  author: z.string().optional(),
  media: mediaEnum.optional(),
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  read_status: readStatusEnum.optional(),
});

export const articleQuerySchema = articleSearchSchema.merge(cursorPaginationSchema).refine(
  (data) => {
    if (data.from && data.to) {
      return data.from <= data.to;
    }
    return true;
  },
  {
    message: 'fromはtoより前の日付を指定してください',
  },
);

export type ArticleQueryParams = z.infer<typeof articleQuerySchema>;
