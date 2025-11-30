import { isFailure } from '@yuukihayashi0510/core'
import { getCookie } from 'hono/cookie'
import { z } from 'zod'
import CONTEXT_KEY from '@/application/middleware/context'
import { ZodValidatedQueryContext } from '@/application/middleware/zodValidator'
import { SESSION_NAME } from '@/common/constants'
import { handleError } from '@/common/errors'
import { OffsetPaginationResult, offsetPaginationSchema } from '@/common/pagination'
import { Article, ArticleQueryParams, createArticleUseCase } from '@/domain/article'
import { ArticleOutput } from '@/domain/article/schema/articleSchema'
import { createUserUseCase } from '@/domain/user'
import getRdbClient from '@/infrastructure/rdb'

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

export default async function getArticles(c: ZodValidatedQueryContext<ApiArticleQueryParams>) {
  const transformedParams = c.req.valid('query')
  const logger = c.get(CONTEXT_KEY.APP_LOG)

  const rdb = getRdbClient(c.env.DATABASE_URL)
  const useCase = createArticleUseCase(rdb)

  // オプショナルに認証済みユーザーのIDを取得
  let activeUserId: bigint | undefined
  const sessionId = getCookie(c, SESSION_NAME)
  if (sessionId && z.string().uuid().safeParse(sessionId).success) {
    const userUseCase = createUserUseCase(rdb)
    const userResult = await userUseCase.getCurrentUser(sessionId)
    if (!isFailure(userResult) && userResult.data) {
      activeUserId = userResult.data.activeUserId
    }
  }

  const result = await useCase.searchArticles(
    convertApiArticleQueryParams(transformedParams, activeUserId),
  )
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

function convertApiArticleQueryParams(
  params: ApiArticleQueryParams,
  activeUserId?: bigint,
): ArticleQueryParams {
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
    activeUserId,
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
    hasRead: article.hasRead,
  }
}
