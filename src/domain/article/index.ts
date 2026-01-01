import { RdbClient } from '@/infrastructure/rdb'
import ArticleCommandImpl from './infrastructure/article-command-impl'
import ArticleQueryImpl from './infrastructure/article-query-impl'
import { UseCase } from './use-case'

export function createArticleUseCase(db: RdbClient): UseCase {
  const articleQuery = new ArticleQueryImpl(db)
  const articleCommand = new ArticleCommandImpl(db)
  return new UseCase(articleQuery, articleCommand)
}

export type { ArticleQueryParams } from './schema/article-query-schema'
export { articleQuerySchema } from './schema/article-query-schema'
export type { Article } from './schema/article-schema'
