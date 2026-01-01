import { RdbClient } from '@/infrastructure/rdb'
import ArticleCommandImpl from './infrastructure/command-impl'
import ArticleQueryImpl from './infrastructure/query-impl'
import { UseCase } from './use-case'

export function createArticleUseCase(db: RdbClient): UseCase {
  const articleQuery = new ArticleQueryImpl(db)
  const articleCommand = new ArticleCommandImpl(db)
  return new UseCase(articleQuery, articleCommand)
}

export type { Article } from './schema/article-schema'
export type { QueryParams } from './schema/query-schema'
export { articleQuerySchema } from './schema/query-schema'
