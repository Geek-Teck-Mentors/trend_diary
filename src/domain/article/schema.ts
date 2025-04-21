import { z } from 'zod';

export const articleSchema = z
  .object({
    articleId: z.bigint(),
    media: z.string().max(10),
    title: z.string().max(100),
    author: z.string().max(30),
    description: z.string().max(255),
    url: z.string().startsWith("http://"),
    createdAt: z.date(),
  })

export type ArticleInput = Pick<z.infer<typeof articleSchema>, 'media' | 'title' | 'author' | 'description' | 'url'>;
export type ArticleOutput = z.output<typeof articleSchema>;

