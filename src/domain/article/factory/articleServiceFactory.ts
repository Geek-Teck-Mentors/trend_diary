import { PrismaClient } from '@prisma/client'
import ArticleQueryServiceImpl from '@/domain/article/infrastructure/articleQueryServiceImpl'
import ArticleService from '@/domain/article/service/articleService'

export default function createArticleService(db: PrismaClient): ArticleService {
  const articleQueryService = new ArticleQueryServiceImpl(db)
  return new ArticleService(articleQueryService)
}
