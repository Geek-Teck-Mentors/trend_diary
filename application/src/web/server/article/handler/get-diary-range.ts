import { isFailure } from '@yuukihayashi0510/core'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
import { handleError } from '@/common/errors'
import { addJstDays, toJstDateString } from '@/common/locale/date'
import { createArticleUseCase } from '@/domain/article'
import type { DailyDiaryRangeItem } from '@/domain/article/schema/diary-schema'
import getRdbClient from '@/infrastructure/rdb'
import CONTEXT_KEY from '@/web/middleware/context'
import type { ZodValidatedQueryContext } from '@/web/middleware/zod-validator'

const DATE_STRING_REGEX = /^\d{4}-\d{2}-\d{2}$/
const DIARY_DAYS = 7

export const diaryRangeQuerySchema = z.object({
  from: z.string().regex(DATE_STRING_REGEX),
  to: z.string().regex(DATE_STRING_REGEX),
})

type DiaryRangeQuery = z.infer<typeof diaryRangeQuerySchema>

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
}

export default async function getDiaryRange(c: ZodValidatedQueryContext<DiaryRangeQuery>) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)
  const sessionUser = c.get(CONTEXT_KEY.SESSION_USER)!
  const query = c.req.valid('query')
  const todayJst = resolveTodayJst()
  const fromDate = ensureValidDiaryDate(query.from)
  const toDate = ensureValidDiaryDate(query.to)

  validateDiaryDateRange(fromDate, toDate, todayJst)

  const rdb = getRdbClient({ db: c.env.DB, databaseUrl: c.env.DATABASE_URL })
  const useCase = createArticleUseCase(rdb)
  const result = await useCase.getDailyDiaryRange(sessionUser.activeUserId, fromDate, toDate)
  if (isFailure(result)) {
    throw handleError(result.error, logger)
  }

  const response = toDiaryRangeResponse(result.data)
  logger.info('daily diary range retrieved successfully', {
    activeUserId: sessionUser.activeUserId,
    from: fromDate,
    to: toDate,
    days: response.data.length,
  })

  return c.json(response, 200)
}

function resolveTodayJst(): string {
  const todayResult = toJstDateString(new Date())
  if (isFailure(todayResult)) {
    throw new HTTPException(500, { message: 'Failed to resolve JST date' })
  }
  return todayResult.data
}

function ensureValidDiaryDate(inputDate: string): string {
  const parsed = new Date(`${inputDate}T00:00:00+09:00`)
  if (Number.isNaN(parsed.getTime())) {
    throwInvalidDateError()
  }

  const normalized = toJstDateString(parsed)
  if (isFailure(normalized) || normalized.data !== inputDate) {
    throwInvalidDateError()
  }

  return inputDate
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

function throwInvalidDateError(): never {
  throw new HTTPException(422, {
    message: 'Invalid input',
    cause: {
      date: ['date must be a valid JST date'],
    },
  })
}

function toDiaryRangeResponse(items: DailyDiaryRangeItem[]): DiaryRangeResponse {
  return {
    data: items.map((item) => ({
      date: item.date,
      summary: item.summary,
      sources: item.sources,
    })),
  }
}
