import { Article as PrismaArticle } from '@prisma/client'
import type { Article } from '@/domain/article/schema/article-schema'
import { fromDbId } from '@/infrastructure/rdb-id'

export default function fromPrismaToArticle(prismaArticle: PrismaArticle): Article {
  return {
    articleId: fromDbId(prismaArticle.articleId),
    media: prismaArticle.media,
    title: prismaArticle.title,
    author: prismaArticle.author,
    description: prismaArticle.description,
    url: prismaArticle.url,
    createdAt: prismaArticle.createdAt,
  }
}
