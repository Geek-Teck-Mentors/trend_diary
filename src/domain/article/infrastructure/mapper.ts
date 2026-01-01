import { Article as PrismaArticle } from '@prisma/client'
import type { Article } from '@/domain/article/schema/article-schema'

export default function fromPrismaToArticle(prismaArticle: PrismaArticle): Article {
  return {
    articleId: prismaArticle.articleId,
    media: prismaArticle.media,
    title: prismaArticle.title,
    author: prismaArticle.author,
    description: prismaArticle.description,
    url: prismaArticle.url,
    createdAt: prismaArticle.createdAt,
  }
}
