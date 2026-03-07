import { isFailure } from '@yuukihayashi0510/core'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import useSWR from 'swr'
import { addJstDays, toJstDateString } from '@/common/locale/date'
import { DEFAULT_PAGE, offsetPaginationSchema } from '@/common/pagination/schema'
import type { ArticleMedia } from '@/domain/article/media'
import useDiaryApi, { type DiaryResponse, type DiarySource } from './use-diary-api'

type DiaryPoint = {
  date: string
  read: number
  skip: number
}

type SummaryRangeData = {
  points: DiaryPoint[]
  weeklySources: DiarySource[]
  dailyByDate: Record<string, DiaryResponse>
}

const DIARY_DAYS = 7

const getTodayJst = () => {
  const result = toJstDateString(new Date())
  if (isFailure(result)) {
    return new Date().toISOString().slice(0, 10)
  }
  return result.data
}

const buildAvailableDates = (todayJst: string) =>
  Array.from({ length: DIARY_DAYS }, (_, index) => {
    const dateResult = addJstDays(todayJst, -(DIARY_DAYS - 1 - index))
    if (isFailure(dateResult)) return todayJst
    return dateResult.data
  })

const sumSourceSummary = (sources: Array<{ read: number; skip: number }>) =>
  sources.reduce(
    (acc, source) => ({
      read: acc.read + source.read,
      skip: acc.skip + source.skip,
    }),
    { read: 0, skip: 0 },
  )

export default function useAnalytics(enabled: boolean) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { fetchDiary, fetchDiaryRange } = useDiaryApi()

  const todayJst = getTodayJst()
  const availableDates = useMemo(() => buildAvailableDates(todayJst), [todayJst])
  const dateParam = searchParams.get('date')
  const pageParam = searchParams.get('page')

  const selectedDate = dateParam && availableDates.includes(dateParam) ? dateParam : null

  const parseResult = offsetPaginationSchema.safeParse({
    page: pageParam ?? undefined,
    limit: 10,
  })
  const rawPage = parseResult.success ? parseResult.data.page : DEFAULT_PAGE
  const page = rawPage >= DEFAULT_PAGE ? rawPage : DEFAULT_PAGE

  const summaryKey = enabled ? ['api/articles/diary-summary-range', ...availableDates] : null
  const { data: summaryRangeData, isLoading: isSummaryLoading } = useSWR<SummaryRangeData>(
    summaryKey,
    async () => {
      const responses = await fetchDiaryRange(availableDates)

      const points = responses.map((response) => ({
        date: response.date,
        ...sumSourceSummary(response.sources),
      }))

      const sourceMap: Record<ArticleMedia, { read: number; skip: number }> = {
        qiita: { read: 0, skip: 0 },
        zenn: { read: 0, skip: 0 },
        hatena: { read: 0, skip: 0 },
      }

      for (const response of responses) {
        for (const source of response.sources) {
          sourceMap[source.media].read += source.read
          sourceMap[source.media].skip += source.skip
        }
      }

      return {
        points,
        weeklySources: (Object.keys(sourceMap) as ArticleMedia[]).map((media) => ({
          media,
          read: sourceMap[media].read,
          skip: sourceMap[media].skip,
        })),
        dailyByDate: Object.fromEntries(
          responses.map((response) => [response.date, response] as const),
        ),
      }
    },
  )

  const swrKey = enabled && selectedDate ? ['api/articles/diary', selectedDate, page] : null
  const { data, isLoading } = useSWR<DiaryResponse>(swrKey, async () => {
    if (!selectedDate) {
      throw new Error('対象日が未選択です')
    }

    const cachedDaily = summaryRangeData?.dailyByDate[selectedDate]
    if (page === 1 && cachedDaily) {
      return cachedDaily
    }

    return fetchDiary(selectedDate, page)
  })

  const reads = data?.reads.data.map((read) => ({ ...read, readAt: new Date(read.readAt) })) ?? []
  const normalizedSummaryRange =
    summaryRangeData?.points ?? availableDates.map((date) => ({ date, read: 0, skip: 0 }))
  const weeklySummary = normalizedSummaryRange.reduce(
    (acc, point) => ({
      read: acc.read + point.read,
      skip: acc.skip + point.skip,
    }),
    { read: 0, skip: 0 },
  )
  const weeklySources = summaryRangeData?.weeklySources ?? [
    { media: 'qiita' as const, read: 0, skip: 0 },
    { media: 'zenn' as const, read: 0, skip: 0 },
    { media: 'hatena' as const, read: 0, skip: 0 },
  ]
  const dailySummary = data ? sumSourceSummary(data.sources) : { read: 0, skip: 0 }

  const updatePage = (nextPage: number) => {
    const nextParams = new URLSearchParams(searchParams)
    if (nextPage <= 1) {
      nextParams.delete('page')
    } else {
      nextParams.set('page', String(nextPage))
    }
    setSearchParams(nextParams)
  }

  const selectDate = (date: string) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('date', date)
    nextParams.delete('page')
    setSearchParams(nextParams)
  }

  const clearSelectedDate = () => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('date')
    nextParams.delete('page')
    setSearchParams(nextParams)
  }

  return {
    mode: 'analytics' as const,
    todayJst,
    selectedDate,
    summaryRange: normalizedSummaryRange,
    weeklySummary,
    dailySummary,
    sources: data?.sources ?? weeklySources,
    reads,
    readPagination: data?.reads ?? {
      data: [],
      page,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    },
    isLoading: isLoading || isSummaryLoading,
    isDateSelected: selectedDate !== null,
    selectDate,
    clearSelectedDate,
    toNextPage: () => updatePage(page + 1),
    toPrevPage: () => updatePage(page - 1),
  }
}
