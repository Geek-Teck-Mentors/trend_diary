import { z } from 'zod';
import { cursorPaginationSchema } from '@/common/pagination';

const mediaEnum = z.enum(['qiita', 'zenn']);
const readStatusEnum = z.enum(['0', '1']);

const baseArticleSearchSchema = z.object({
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
});

const articleSearchSchema = baseArticleSearchSchema.extend({
  readStatus: readStatusEnum.optional(),
});

// 日付の範囲チェック用のrefine関数
const dateRangeRefine = <T extends { from?: string; to?: string }>(data: T) => {
  if (data.from && data.to) {
    return data.from <= data.to;
  }
  return true;
};

// エラーメッセージ
const DATE_RANGE_ERROR_MESSAGE = 'fromはtoより前の日付を指定してください';

export const articleQuerySchema = articleSearchSchema
  .merge(cursorPaginationSchema)
  .refine(dateRangeRefine, {
    message: DATE_RANGE_ERROR_MESSAGE,
  });

export type ArticleQueryParams = z.infer<typeof articleQuerySchema>;

export const apiArticleQuerySchema = articleSearchSchema
  .extend({
    read_status: readStatusEnum.optional(),
  })
  .merge(cursorPaginationSchema)
  .refine(dateRangeRefine, {
    message: DATE_RANGE_ERROR_MESSAGE,
  });

export type ApiArticleQueryParams = z.infer<typeof apiArticleQuerySchema>;
