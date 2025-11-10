import { RdbClient } from '@/infrastructure/rdb'
import ArticleCommandImpl from './infrastructure/articleCommandImpl'
import ArticleQueryImpl from './infrastructure/articleQueryImpl'
import { UseCase } from './useCase'

export function createArticleUseCase(db: RdbClient): UseCase {
  const articleQuery = new ArticleQueryImpl(db)
  const articleCommand = new ArticleCommandImpl(db)
  return new UseCase(articleQuery, articleCommand)
}

export type { ArticleQueryParams } from './schema/articleQuerySchema'
export { articleQuerySchema } from './schema/articleQuerySchema'
export type { Article } from './schema/articleSchema'
