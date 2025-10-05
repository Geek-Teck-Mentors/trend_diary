import CONTEXT_KEY from '@/application/middleware/context'
import { ZodValidatedQueryContext } from '@/application/middleware/zodValidator'
import { handleError } from '@/common/errors'
import { isError } from '@/common/types/utility'
import { Article, createArticleUseCase } from '@/domain/article'
import { ApiArticleQueryParams } from '@/domain/article/schema/articleQuerySchema'
import getRdbClient from '@/infrastructure/rdb'
import { convertApiArticleQueryParams } from './request'
import { ArticleListResponse, ArticleResponse } from './response'

function convertToResponse(article: Article): ArticleResponse {
  return {
    articleId: article.articleId.toString(),
    media: article.media,
    title: article.title,
    author: article.author,
    description: article.description,
    url: article.url,
    createdAt: article.createdAt,
  }
}

export default async function getArticles(c: ZodValidatedQueryContext<ApiArticleQueryParams>) {
  const transformedParams = c.req.valid('query')
  const logger = c.get(CONTEXT_KEY.APP_LOG)

  const rdb = getRdbClient(c.env.DATABASE_URL)
  const useCase = createArticleUseCase(rdb)

  const result = await useCase.searchArticles(convertApiArticleQueryParams(transformedParams))
  if (isError(result)) {
    throw handleError(result.error, logger)
  }

  const paginationResult = result.data
  logger.info('articles retrieved successfully', { count: paginationResult.data.length })
  const response: ArticleListResponse = {
    data: paginationResult.data.map(convertToResponse),
    page: paginationResult.page,
    limit: paginationResult.limit,
    total: paginationResult.total,
    totalPages: paginationResult.totalPages,
    hasNext: paginationResult.hasNext,
    hasPrev: paginationResult.hasPrev,
  }
  return c.json(response)
}
