import { z } from 'zod'
import { createApiHandler, type RequestContext } from '@/application/api/handler/factory'
import { OffsetPaginationResult, offsetPaginationSchema } from '@/common/pagination'
import { Article, ArticleQueryParams, createArticleUseCase } from '@/domain/article'
import { ArticleOutput } from '@/domain/article/schema/articleSchema'

const mediaEnum = z.enum(['qiita', 'zenn'])
const readStatusEnum = z.enum(['0', '1'])
const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional()

const baseArticleSearchSchema = z.object({
  title: z.string().optional(),
  author: z.string().optional(),
  media: mediaEnum.optional(),
  from: dateStringSchema,
  to: dateStringSchema,
})

// 日付の範囲チェック用のrefine関数
const dateRangeRefine = <T extends { from?: string; to?: string }>(data: T) => {
  if (data.from && data.to) {
    return data.from <= data.to
  }
  return true
}

// エラーメッセージ
const DATE_RANGE_ERROR_MESSAGE = 'fromはtoより前の日付を指定してください'

export const apiArticleQuerySchema = baseArticleSearchSchema
  .extend({
    read_status: readStatusEnum.optional(),
  })
  .merge(offsetPaginationSchema)
  .refine(dateRangeRefine, {
    message: DATE_RANGE_ERROR_MESSAGE,
  })

export type ApiArticleQueryParams = z.infer<typeof apiArticleQuerySchema>

export type ArticleResponse = Omit<ArticleOutput, 'articleId'> & {
  articleId: string
}

export type ArticleListResponse = OffsetPaginationResult<ArticleResponse>

export default createApiHandler({
  createUseCase: createArticleUseCase,
  execute: (useCase, context: RequestContext<unknown, unknown, ApiArticleQueryParams>) =>
    useCase.searchArticles(convertApiArticleQueryParams(context.query)),
  transform: (data) => ({
    data: data.data.map(convertToResponse),
    page: data.page,
    limit: data.limit,
    total: data.total,
    totalPages: data.totalPages,
    hasNext: data.hasNext,
    hasPrev: data.hasPrev,
  }),
  logMessage: 'articles retrieved successfully',
  logPayload: (data) => ({ count: data.data.length }),
  statusCode: 200,
})

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
