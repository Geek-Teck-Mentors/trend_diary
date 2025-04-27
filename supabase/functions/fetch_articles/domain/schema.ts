import { z } from 'npm:zod';

export const articleSchema = z.object({
  articleId: z.bigint(),
  media: z.string().max(10),
  title: z.string().max(100),
  author: z.string().max(30),
  description: z.string().max(255),
  url: z.string().startsWith('http://'),
  createdAt: z.date(),
});

export type ArticleInput = Pick<
  z.infer<typeof articleSchema>,
  'media' | 'title' | 'author' | 'description' | 'url'
>;
export type ArticleOutput = z.output<typeof articleSchema>;

export const normalizeForArticleInput = (params: ArticleInput): ArticleInput => ({
  media: params.media.length > 10 ? params.media.slice(0, 10) : params.media,
  title: params.title.length > 100 ? params.title.slice(0, 100) : params.title,
  author: params.author.length > 30 ? params.author.slice(0, 30) : params.author,
  description:
    params.description.length > 255 ? params.description.slice(0, 255) : params.description,
  url: params.url,
});
