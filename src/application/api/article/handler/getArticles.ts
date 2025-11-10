import { isFailure } from '@yuukihayashi0510/core'
import CONTEXT_KEY from '@/application/middleware/context'
import { ZodValidatedQueryContext } from '@/application/middleware/zodValidator'
import { handleError } from '@/common/errors'
import { OffsetPaginationResult } from '@/common/pagination'
import { Article, createArticleUseCase } from '@/domain/article'
import {
  ApiArticleQueryParams,
  ArticleQueryParams,
} from '@/domain/article/schema/articleQuerySchema'
import { ArticleOutput } from '@/domain/article/schema/articleSchema'
import getRdbClient from '@/infrastructure/rdb'

export type ArticleResponse = Omit<ArticleOutput, 'articleId'> & {
  articleId: string
}

export type ArticleListResponse = OffsetPaginationResult<ArticleResponse>

export default async function getArticles(c: ZodValidatedQueryContext<ApiArticleQueryParams>) {
  const transformedParams = c.req.valid('query')
  const logger = c.get(CONTEXT_KEY.APP_LOG)

  const rdb = getRdbClient(c.env.DATABASE_URL)
  const useCase = createArticleUseCase(rdb)

  const result = await useCase.searchArticles(convertApiArticleQueryParams(transformedParams))
  if (isFailure(result)) {
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

function convertApiArticleQueryParams(params: ApiArticleQueryParams): ArticleQueryParams {
  let readStatus: boolean | undefined
  if (params.read_status === '1') {
    readStatus = true
  } else if (params.read_status === '0') {
    readStatus = false
  } else {
    readStatus = undefined
  }

  return {
    limit: params.limit,
    page: params.page,
    title: params.title,
    author: params.author,
    media: params.media,
    from: params.from,
    to: params.to,
    readStatus,
  }
}

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
