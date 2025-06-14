import { PrismaClient } from '@prisma/client';
import ArticleService from '@/domain/article/service/articleService';
import ArticleQueryServiceImpl from '@/domain/article/infrastructure/articleQueryServiceImpl';

export default function createArticleService(db: PrismaClient): ArticleService {
  const articleQueryService = new ArticleQueryServiceImpl(db);
  return new ArticleService(articleQueryService);
}
