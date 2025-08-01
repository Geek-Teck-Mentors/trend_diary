import { z } from 'zod'

export const articleSchema = z.object({
  articleId: z.bigint(),
  media: z.string().max(10),
  title: z.string().max(100),
  author: z.string().max(30),
  description: z.string().max(255),
  url: z.string().url(),
  createdAt: z.date(),
})

export type ArticleInput = Omit<z.infer<typeof articleSchema>, 'articleId' | 'createdAt'>
export type ArticleOutput = z.output<typeof articleSchema>
