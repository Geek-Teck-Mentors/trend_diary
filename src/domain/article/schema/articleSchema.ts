import { z } from 'zod'
import { createdAt } from '@/common/schemas'

export const articleSchema = z.object({
  articleId: z.bigint(),
  media: z.string().max(10),
  title: z.string().max(100),
  author: z.string().max(30),
  description: z.string().max(255),
  url: z.string().url(),
  createdAt,
})

export const articleWithReadStatusSchema = articleSchema.extend({
  isRead: z.boolean(),
})

export type Article = z.infer<typeof articleSchema>
export type ArticleInput = Omit<z.infer<typeof articleSchema>, 'articleId' | 'createdAt'>
export type ArticleOutput = z.output<typeof articleSchema>
export type ArticleWithReadStatus = z.infer<typeof articleWithReadStatusSchema>
export type ArticleWithReadStatusOutput = z.output<typeof articleWithReadStatusSchema>
