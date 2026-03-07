import { isFailure } from '@yuukihayashi0510/core'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
import { handleError } from '@/common/errors'
import { addJstDays, toJstDateString } from '@/common/locale/date'
import { DEFAULT_PAGE } from '@/common/pagination'
import { createArticleUseCase } from '@/domain/article'
import type { DailyDiary } from '@/domain/article/schema/diary-schema'
import getRdbClient from '@/infrastructure/rdb'
import CONTEXT_KEY from '@/web/middleware/context'
import type { ZodValidatedQueryContext } from '@/web/middleware/zod-validator'

const DATE_STRING_REGEX = /^\d{4}-\d{2}-\d{2}$/
const DIARY_DAYS = 7
export const DIARY_READ_LIMIT = 10

export const diaryQuerySchema = z.object({
  date: z.string().regex(DATE_STRING_REGEX).optional(),
  page: z.coerce.number().int().min(1).optional().default(DEFAULT_PAGE),
})

type DiaryQuery = z.infer<typeof diaryQuerySchema>

type DiaryResponse = {
  date: string
  sources: Array<{
    media: string
    read: number
    skip: number
  }>
  reads: {
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

  const targetDate = resolveTargetDate(query.date)
  validateDiaryRange(targetDate)

  const rdb = getRdbClient({ db: c.env.DB, databaseUrl: c.env.DATABASE_URL })
  const useCase = createArticleUseCase(rdb)
  const result = await useCase.getDailyDiary(
    sessionUser.activeUserId,
    targetDate,
    query.page,
    DIARY_READ_LIMIT,
  )
  if (isFailure(result)) {
    throw handleError(result.error, logger)
  }

  logger.info('daily diary retrieved successfully', {
    activeUserId: sessionUser.activeUserId,
    date: targetDate,
    read: result.data.sources.reduce((sum, source) => sum + source.read, 0),
    skip: result.data.sources.reduce((sum, source) => sum + source.skip, 0),
  })

  return c.json(toDiaryResponse(result.data), 200)
}

function resolveTargetDate(inputDate?: string): string {
  if (inputDate) return inputDate

  const todayResult = toJstDateString(new Date())
  if (isFailure(todayResult)) {
    throw new HTTPException(500, { message: 'Failed to resolve JST date' })
  }
  return todayResult.data
}

function validateDiaryRange(targetDate: string) {
  const todayResult = toJstDateString(new Date())
  if (isFailure(todayResult)) {
    throw new HTTPException(500, { message: 'Failed to resolve JST date' })
  }

  const earliestResult = addJstDays(todayResult.data, -(DIARY_DAYS - 1))
  if (isFailure(earliestResult)) {
    throw new HTTPException(500, { message: 'Failed to resolve diary date range' })
  }

  if (targetDate < earliestResult.data || targetDate > todayResult.data) {
    throw new HTTPException(422, {
      message: 'Invalid input',
      cause: {
        date: [`date must be between ${earliestResult.data} and ${todayResult.data}`],
      },
    })
  }
}

function toDiaryResponse(data: DailyDiary): DiaryResponse {
  return {
    date: data.date,
    sources: data.sources,
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
