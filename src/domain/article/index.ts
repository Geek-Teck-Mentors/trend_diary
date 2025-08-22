import { RdbClient } from '@/infrastructure/rdb'
import ArticleCommandServiceImpl from './infrastructure/articleCommandServiceImpl'
import ArticleQueryServiceImpl from './infrastructure/articleQueryServiceImpl'
import { UseCase } from './useCase'

export function createArticleService(db: RdbClient): UseCase {
  const articleQuery = new ArticleQueryServiceImpl(db)
  const articleCommand = new ArticleCommandServiceImpl(db)
  return new UseCase(articleQuery, articleCommand)
}

export type { ArticleQueryParams } from './schema/articleQuerySchema'
export { articleQuerySchema } from './schema/articleQuerySchema'
export type { Article } from './schema/articleSchema'
export type {
  ArticleIdParam,
  CreateReadHistoryApiInput,
} from './schema/readHistorySchema'
export {
  articleIdParamSchema,
  createReadHistoryApiSchema,
} from './schema/readHistorySchema'
