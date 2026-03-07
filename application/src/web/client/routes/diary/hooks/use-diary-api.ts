import type { ArticleMedia } from '@/domain/article/media'
import createSWRFetcher from '@/web/client/features/create-swr-fetcher'

export type DiarySource = {
  media: ArticleMedia
  read: number
  skip: number
}

export type DiaryReadItemResponse = {
  readHistoryId: string
  articleId: string
  media: ArticleMedia
  title: string
  url: string
  readAt: string
}

export type DiaryResponse = {
  date: string
  sources: DiarySource[]
  reads: {
    data: DiaryReadItemResponse[]
    page: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export default function useDiaryApi() {
  const { client, apiCall } = createSWRFetcher()

  const fetchDiary = async (date: string, page: number) => {
    const result = await apiCall<DiaryResponse>(() =>
      client.articles.diary.$get(
        {
          query: {
            date,
            page,
          },
        },
        { init: { credentials: 'include' } },
      ),
    )

    if (!result) {
      throw new Error('ダイアリーの取得に失敗しました')
    }

    return result
  }

  const fetchDiaryRange = async (dates: string[]) => {
    const responses = await Promise.all(dates.map((date) => fetchDiary(date, 1)))
    return responses
  }

  return {
    fetchDiary,
    fetchDiaryRange,
  }
}
