import { PrismaClient } from '@prisma/client'
import ArticleQueryServiceImpl from '@/domain/article/infrastructure/articleQueryServiceImpl'
import ArticleService from '@/domain/article/service/articleService'
import ArticleCommandServiceImpl from '@/domain/article/infrastructure/articleCommandServiceImpl';

export default function createArticleService(db: PrismaClient): ArticleService {
  const articleQueryService = new ArticleQueryServiceImpl(db)
  const articleCommandService = new ArticleCommandServiceImpl(db);
  return new ArticleService(articleQueryService, articleCommandService)
}
