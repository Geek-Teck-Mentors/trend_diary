import { RdbClient } from '@/infrastructure/rdb'
import ArticleCommandServiceImpl from './infrastructure/articleCommandServiceImpl'
import ArticleQueryServiceImpl from './infrastructure/articleQueryServiceImpl'
import ArticleService from './service/articleService'

export function createArticleService(db: RdbClient): ArticleService {
  const articleQueryService = new ArticleQueryServiceImpl(db)
  const articleCommandService = new ArticleCommandServiceImpl(db)
  return new ArticleService(articleQueryService, articleCommandService)
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
