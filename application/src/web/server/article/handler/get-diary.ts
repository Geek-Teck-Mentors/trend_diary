import { isFailure } from '@yuukihayashi0510/core'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
import { handleError } from '@/common/errors'
import { addJstDays } from '@/common/locale/date'
import { createArticleUseCase } from '@/domain/article'
import { DIARY_DAYS } from '@/domain/article/diary'
import type { DailyDiary, DailyDiaryRangeItem } from '@/domain/article/schema/diary-schema'
import getRdbClient from '@/infrastructure/rdb'
import CONTEXT_KEY from '@/web/middleware/context'
import type { ZodValidatedQueryContext } from '@/web/middleware/zod-validator'
import {
  DATE_STRING_REGEX,
  ensureValidDiaryDate,
  resolveTodayJst,
} from '@/web/server/article/handler/diary-date'

const DIARY_READ_LIMIT = 10

export const diaryQuerySchema = z.object({
  from: z.string().regex(DATE_STRING_REGEX),
  to: z.string().regex(DATE_STRING_REGEX),
  page: z.coerce.number().int().min(1).optional(),
})

type DiaryQuery = z.infer<typeof diaryQuerySchema>

type DiaryRangeResponse = {
  data: Array<{
    date: string
    summary: {
      read: number
      skip: number
    }
    sources: Array<{
      media: string
      read: number
      skip: number
    }>
  }>
  reads?: {
    data: Array<{
      readHistoryId: string
      articleId: string
      media: string
      title: string
      url: string
      readAt: Date
    }>
    page: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export default async function getDiary(c: ZodValidatedQueryContext<DiaryQuery>) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)
  const sessionUser = c.get(CONTEXT_KEY.SESSION_USER)!
  const query = c.req.valid('query')
  const todayJst = resolveTodayJst()
  const fromDate = ensureValidDiaryDate(query.from)
  const toDate = ensureValidDiaryDate(query.to)

  validateDiaryDateRange(fromDate, toDate, todayJst)

  const rdb = getRdbClient({ db: c.env.DB, databaseUrl: c.env.DATABASE_URL })
  const useCase = createArticleUseCase(rdb)

  if (query.page !== undefined) {
    validateDiaryDetailQuery(fromDate, toDate)
    const detailResult = await useCase.getDailyDiary(
      sessionUser.activeUserId,
      fromDate,
      query.page,
      DIARY_READ_LIMIT,
    )
    if (isFailure(detailResult)) {
      throw handleError(detailResult.error, logger)
    }

    const response = toDiaryDetailResponse(detailResult.data)
    logger.info('daily diary detail retrieved successfully', {
      activeUserId: sessionUser.activeUserId,
      date: fromDate,
      page: query.page,
      read: detailResult.data.summary.read,
      skip: detailResult.data.summary.skip,
    })
    return c.json(response, 200)
  }

  const result = await useCase.getDailyDiaryRange(sessionUser.activeUserId, fromDate, toDate)
  if (isFailure(result)) {
    throw handleError(result.error, logger)
  }
  const response = toDiaryResponse(result.data)
  logger.info('daily diary range retrieved successfully', {
    activeUserId: sessionUser.activeUserId,
    from: fromDate,
    to: toDate,
    days: response.data.length,
  })

  return c.json(response, 200)
}
function validateDiaryDateRange(fromDate: string, toDate: string, todayJst: string) {
  if (fromDate > toDate) {
    throw new HTTPException(422, {
      message: 'Invalid input',
      cause: {
        from: ['from must be less than or equal to to'],
      },
    })
  }

  const earliestResult = addJstDays(todayJst, -(DIARY_DAYS - 1))
  if (isFailure(earliestResult)) {
    throw new HTTPException(500, { message: 'Failed to resolve diary date range' })
  }
  const earliestDate = earliestResult.data

  const causes: { from?: string[]; to?: string[] } = {}
  if (fromDate < earliestDate) {
    causes.from = [`from must be on or after ${earliestDate}`]
  }
  if (toDate > todayJst) {
    causes.to = [`to must be on or before ${todayJst}`]
  }

  if (causes.from || causes.to) {
    throw new HTTPException(422, {
      message: 'Invalid input',
      cause: causes,
    })
  }
}

function validateDiaryDetailQuery(fromDate: string, toDate: string) {
  if (fromDate === toDate) return

  throw new HTTPException(422, {
    message: 'Invalid input',
    cause: {
      page: ['page is available only when from and to are the same date'],
    },
  })
}

function toDiaryDetailResponse(data: DailyDiary): DiaryRangeResponse {
  return {
    data: [
      {
        date: data.date,
        summary: data.summary,
        sources: data.sources,
      },
    ],
    reads: {
      data: data.reads.data.map((read) => ({
        readHistoryId: read.readHistoryId.toString(),
        articleId: read.articleId.toString(),
        media: read.media,
        title: read.title,
        url: read.url,
        readAt: read.readAt,
      })),
      page: data.reads.page,
      totalPages: data.reads.totalPages,
      hasNext: data.reads.hasNext,
      hasPrev: data.reads.hasPrev,
    },
  }
}

function toDiaryResponse(items: DailyDiaryRangeItem[]): DiaryRangeResponse {
  return {
    data: items.map((item) => ({
      date: item.date,
      summary: item.summary,
      sources: item.sources,
    })),
  }
}
