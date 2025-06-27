import { z } from 'zod';

export const readHistorySchema = z.object({
  readHistoryId: z.bigint(),
  userId: z.bigint(),
  articleId: z.bigint(),
  readAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createReadHistoryApiSchema = z.object({
  readAt: z.string().datetime(),
});

export const articleIdParamSchema = z.object({
  article_id: z
    .string()
    .min(1)
    .refine((val) => /^\d+$/.test(val), {
      message: 'article_id must be a valid number',
    })
    .transform((val) => BigInt(val)),
});

export type ReadHistoryOutput = z.output<typeof readHistorySchema>;
export type CreateReadHistoryApiInput = z.input<typeof createReadHistoryApiSchema>;
export type ArticleIdParam = z.output<typeof articleIdParamSchema>;
