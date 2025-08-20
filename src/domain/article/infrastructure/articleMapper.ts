import { Article as PrismaArticle } from '@prisma/client'
import Article from '@/domain/article/model/article'

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
