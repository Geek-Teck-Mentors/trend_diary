import type { RenderHookResult } from '@testing-library/react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { toast } from 'sonner'
import type { MockedFunction } from 'vitest'
import { ArticleOutput as Article } from '@/domain/article/schema/articleSchema'
import getApiClientForClient from '../../infrastructure/api'
import useTrends from './useTrends'

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}))

vi.mock('../../infrastructure/api', () => ({
  default: vi.fn(),
}))

const defaultFakeArticle: Article = {
  articleId: BigInt(1),
  media: 'qiita',
  title: 'デフォルトタイトル',
  author: 'デフォルト筆者',
  description: 'デフォルトの説明文です',
  url: 'https://example.com',
  createdAt: new Date('2024-01-01T00:00:00Z'),
}

const generateFakeArticle = (params?: Partial<Article>): Article => ({
  ...defaultFakeArticle,
  ...params,
})

const mockApiClient = {
  articles: {
    // biome-ignore lint/style/useNamingConvention: $get is a Hono client method name
    $get: vi.fn(),
  },
}

const generateFakeResponse = (
  params?: Partial<{
    status: number
    articles: Article[]
    nextCursor: string | null
    prevCursor: string | null
  }>,
) => ({
  status: params?.status || 200,
  json: vi.fn().mockResolvedValue({
    data: params?.articles || [],
    nextCursor: params?.nextCursor || null,
    prevCursor: params?.prevCursor || null,
  }),
})

const mockGetApiClientForClient = getApiClientForClient as MockedFunction<any>
type UseTrendsHook = ReturnType<typeof useTrends>

function setupHook(): RenderHookResult<UseTrendsHook, unknown> {
  return renderHook(() => useTrends())
}

describe('useTrends', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetApiClientForClient.mockReturnValue(mockApiClient)
  })

  afterAll(() => {
    vi.clearAllMocks()
  })

  describe('基本動作', () => {
    it('初期化時に今日の日付で記事一覧が取得できる', async () => {
      const fakeArticles = [
        generateFakeArticle({ articleId: BigInt(1), title: '記事1' }),
        generateFakeArticle({ articleId: BigInt(2), title: '記事2' }),
      ]

      const fakeResponse = generateFakeResponse({
        articles: fakeArticles,
        nextCursor: 'next-cursor',
        prevCursor: 'prev-cursor',
      })

      mockApiClient.articles.$get.mockResolvedValue(fakeResponse)

      const { result } = setupHook()

      await waitFor(() => {
        expect(result.current.articles).toHaveLength(2)
      })

      expect(mockApiClient.articles.$get).toHaveBeenCalledWith({
        query: {
          to: expect.stringMatching(/\d{4}-\d{2}-\d{2}/),
          from: expect.stringMatching(/\d{4}-\d{2}-\d{2}/),
          direction: 'next',
          cursor: undefined,
          limit: 20,
        },
      })
      expect(result.current.articles[0].title).toBe('記事1')
      expect(result.current.cursor.next).toBe('next-cursor')
      expect(result.current.cursor.prev).toBe('prev-cursor')
    })

    it('directionをnextに設定すると、次のページが取得できる', async () => {
      const initialFakeResponse = generateFakeResponse({
        nextCursor: 'next-cursor-initial',
        prevCursor: null,
      })

      const nextPageFakeResponse = generateFakeResponse({
        articles: [generateFakeArticle({ articleId: BigInt(3), title: '記事3' })],
        nextCursor: 'next-cursor-2',
        prevCursor: 'prev-cursor-2',
      })

      mockApiClient.articles.$get.mockResolvedValueOnce(initialFakeResponse)

      const { result } = setupHook()

      await waitFor(() => {
        expect(result.current.cursor.next).toBe('next-cursor-initial')
      })

      mockApiClient.articles.$get.mockResolvedValueOnce(nextPageFakeResponse)

      await act(async () => {
        await result.current.fetchArticles({
          date: new Date('2024-01-01'),
          direction: 'next',
        })
      })

      expect(mockApiClient.articles.$get).toHaveBeenLastCalledWith({
        query: {
          to: '2024-01-01',
          from: '2024-01-01',
          direction: 'next',
          cursor: 'next-cursor-initial',
          limit: 20,
        },
      })
      expect(result.current.articles).toHaveLength(1)
      expect(result.current.articles[0].title).toBe('記事3')
    })

    it('directionをprevに設定すると、前のページが取得できる', async () => {
      const initialFakeResponse = generateFakeResponse({
        nextCursor: null,
        prevCursor: 'prev-cursor-initial',
      })

      const prevPageFakeResponse = generateFakeResponse({
        articles: [generateFakeArticle({ articleId: BigInt(4), title: '記事4' })],
        nextCursor: 'next-cursor-3',
        prevCursor: 'prev-cursor-3',
      })

      mockApiClient.articles.$get.mockResolvedValueOnce(initialFakeResponse)

      const { result } = setupHook()

      await waitFor(() => {
        expect(result.current.cursor.prev).toBe('prev-cursor-initial')
      })

      mockApiClient.articles.$get.mockResolvedValueOnce(prevPageFakeResponse)

      await act(async () => {
        await result.current.fetchArticles({
          date: new Date('2024-01-01'),
          direction: 'prev',
        })
      })

      expect(mockApiClient.articles.$get).toHaveBeenLastCalledWith({
        query: {
          to: '2024-01-01',
          from: '2024-01-01',
          direction: 'prev',
          cursor: 'prev-cursor-initial',
          limit: 20,
        },
      })
      expect(result.current.articles).toHaveLength(1)
      expect(result.current.articles[0].title).toBe('記事4')
    })

    it('loading中はisLoadingがtrueになる', async () => {
      let resolvePromise: () => void
      const mockPromise = new Promise<any>((resolve) => {
        resolvePromise = () =>
          resolve({
            status: 200,
            json: () =>
              Promise.resolve({
                data: [],
                nextCursor: null,
                prevCursor: null,
              }),
          })
      })

      mockApiClient.articles.$get.mockReturnValue(mockPromise)

      const { result } = setupHook()

      expect(result.current.isLoading).toBe(true)

      await act(async () => {
        resolvePromise!()
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('limitを設定すると1度に取得できる記事の数を制限できる', async () => {
      const initialFakeResponse = generateFakeResponse()

      const limitFakeResponse = generateFakeResponse()

      mockApiClient.articles.$get.mockResolvedValueOnce(initialFakeResponse)

      const { result } = setupHook()

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      mockApiClient.articles.$get.mockResolvedValueOnce(limitFakeResponse)

      await act(async () => {
        await result.current.fetchArticles({
          date: new Date('2024-01-01'),
          limit: 10,
        })
      })

      expect(mockApiClient.articles.$get).toHaveBeenLastCalledWith({
        query: {
          to: '2024-01-01',
          from: '2024-01-01',
          direction: 'next',
          cursor: null,
          limit: 10,
        },
      })
    })

    it('記事一覧を取得したタイミングで、前後のページの情報が更新される', async () => {
      const fakeResponse = generateFakeResponse({
        articles: [generateFakeArticle()],
        nextCursor: 'updated-next-cursor',
        prevCursor: 'updated-prev-cursor',
      })

      mockApiClient.articles.$get.mockResolvedValue(fakeResponse)

      const { result } = setupHook()

      await waitFor(() => {
        expect(result.current.cursor.next).toBe('updated-next-cursor')
        expect(result.current.cursor.prev).toBe('updated-prev-cursor')
      })
    })

    it('記事が0件でも正しく処理される', async () => {
      const fakeResponse = generateFakeResponse()

      mockApiClient.articles.$get.mockResolvedValue(fakeResponse)

      const { result } = setupHook()

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.articles).toEqual([])
      expect(result.current.cursor.next).toBeNull()
      expect(result.current.cursor.prev).toBeNull()
    })
  })

  describe('エッジケース', () => {
    it('ローディング中に再度fetchArticlesを呼び出しても処理されない', async () => {
      let resolvePromise: () => void
      const mockPromise = new Promise<any>((resolve) => {
        resolvePromise = () =>
          resolve({
            status: 200,
            json: () =>
              Promise.resolve({
                data: [],
                nextCursor: null,
                prevCursor: null,
              }),
          })
      })

      mockApiClient.articles.$get.mockReturnValue(mockPromise)

      const { result } = setupHook()

      expect(result.current.isLoading).toBe(true)

      await act(async () => {
        await result.current.fetchArticles({
          date: new Date('2024-01-01'),
        })
      })

      expect(mockApiClient.articles.$get).toHaveBeenCalledTimes(1)

      await act(async () => {
        resolvePromise!()
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })
  })

  describe('APIのエラーケース', () => {
    it('API呼び出しで400番台の時、エラーのtoastが表示される', async () => {
      const fakeResponse = generateFakeResponse({ status: 400 })

      mockApiClient.articles.$get.mockResolvedValue(fakeResponse)

      const { result } = setupHook()

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('不正なパラメータです')
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('API呼び出しで500番台の時、エラーのtoastが表示される', async () => {
      const fakeResponse = generateFakeResponse({ status: 500 })

      mockApiClient.articles.$get.mockResolvedValue(fakeResponse)

      const { result } = setupHook()

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('不明なエラーが発生しました')
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('その他のエラーの時、エラーのtoastが表示される', async () => {
      const otherErrorMessage = 'その他のエラーが発生しました'
      const networkError = new Error(otherErrorMessage)
      mockApiClient.articles.$get.mockRejectedValue(networkError)

      const { result } = renderHook(() => useTrends())

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(otherErrorMessage)
        expect(result.current.isLoading).toBe(false)
      })
    })
  })
})
