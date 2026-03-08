import { useSearchParams } from 'react-router'
import useSWR from 'swr'
import { DEFAULT_PAGE, offsetPaginationSchema } from '@/common/pagination/schema'
import type { ArticleMedia } from '@/domain/article/media'
import { getTodayJst, sumSourceSummary } from '@/web/client/routes/diary/hooks/diary-shared'
import useDiaryApi from './use-diary-api'

type DiaryReadItem = {
  readHistoryId: string
  articleId: string
  media: ArticleMedia
  title: string
  url: string
  readAt: Date
}

const emptySources = [
  { media: 'qiita' as const, read: 0, skip: 0 },
  { media: 'zenn' as const, read: 0, skip: 0 },
  { media: 'hatena' as const, read: 0, skip: 0 },
]

export default function useDiary(enabled: boolean) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { fetchDiary } = useDiaryApi()
  const todayJst = getTodayJst()

  const pageParam = searchParams.get('page')
  const parseResult = offsetPaginationSchema.safeParse({
    page: pageParam ?? undefined,
    limit: 10,
  })
  const page = parseResult.success ? parseResult.data.page : DEFAULT_PAGE

  const swrKey = enabled ? ['api/articles/diary', todayJst, page] : null
  const { data, isLoading } = useSWR(swrKey, () => fetchDiary(todayJst, page))

  const reads: DiaryReadItem[] =
    data?.reads.data.map((read) => ({ ...read, readAt: new Date(read.readAt) })) ?? []
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

  return {
    mode: 'diary' as const,
    todayJst,
    selectedDate: todayJst,
    summaryRange: [],
    weeklySummary: dailySummary,
    dailySummary,
    sources: data?.sources ?? emptySources,
    reads,
    readPagination: data?.reads ?? {
      data: [],
      page,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    },
    isLoading,
    selectDate: () => undefined,
    clearSelectedDate: () => undefined,
    toNextPage: () => updatePage(page + 1),
    toPrevPage: () => updatePage(page - 1),
  }
}
