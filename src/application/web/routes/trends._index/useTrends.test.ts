import type { RenderHookResult } from '@testing-library/react'
import { act, renderHook } from '@testing-library/react'
import { toast } from 'sonner'
import type { MockedFunction } from 'vitest'
import { ArticleOutput as Article } from '@/domain/article/schema/articleSchema'
import getApiClientForClient from '../../infrastructure/api'
import useTrends from './useTrends'

// Mocks
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}))

vi.mock('../../infrastructure/api', () => ({
  default: vi.fn(),
}))

const defaultMockArticle: Article = {
  articleId: BigInt(1),
  media: 'qiita',
  title: 'デフォルトタイトル',
  author: 'デフォルト筆者',
  description: 'デフォルトの説明文です',
  url: 'https://example.com',
  createdAt: new Date('2024-01-01T00:00:00Z'),
}

// モックのArticleデータ
const generateMockArticle = (params?: Partial<Article>): Article => ({
  ...defaultMockArticle,
  ...params,
})

const mockApiClient = {
  articles: {
    // biome-ignore lint/style/useNamingConvention: $get is a Hono client method name
    $get: vi.fn(),
  },
}

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

  afterEach(() => {
    vi.clearAllTimers()
  })

  afterAll(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  })

  describe('基本動作', () => {
    it('現在の日時が取得できる', async () => {
      const mockResponse = {
        status: 200,
        json: vi.fn().mockResolvedValue({
          data: [],
          nextCursor: null,
          prevCursor: null,
        }),
      }
      mockApiClient.articles.$get.mockResolvedValue(mockResponse)

      const { result } = setupHook()

      expect(result.current.date).toBeInstanceOf(Date)
    })

    it('初期化時に今日の日付で記事一覧が取得できる', async () => {
      const mockArticles = [
        generateMockArticle({ articleId: BigInt(1), title: '記事1' }),
        generateMockArticle({ articleId: BigInt(2), title: '記事2' }),
      ]

      const mockResponse = {
        status: 200,
        json: vi.fn().mockResolvedValue({
          data: mockArticles.map((article) => ({
            ...article,
            articleId: article.articleId.toString(),
            createdAt: article.createdAt.toISOString(),
          })),
          nextCursor: 'next-cursor',
          prevCursor: 'prev-cursor',
        }),
      }

      mockApiClient.articles.$get.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useTrends())

      // 初期化時のAPI呼び出しを待つ
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
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
      expect(result.current.articles).toHaveLength(2)
      expect(result.current.articles[0].title).toBe('記事1')
      expect(result.current.cursor.next).toBe('next-cursor')
      expect(result.current.cursor.prev).toBe('prev-cursor')
    })

    it('directionをnextに設定すると、次のページが取得できる', async () => {
      const initialMockResponse = {
        status: 200,
        json: vi.fn().mockResolvedValue({
          data: [],
          nextCursor: 'next-cursor-initial',
          prevCursor: null,
        }),
      }

      const nextPageMockResponse = {
        status: 200,
        json: vi.fn().mockResolvedValue({
          data: [generateMockArticle({ articleId: BigInt(3), title: '記事3' })],
          nextCursor: 'next-cursor-2',
          prevCursor: 'prev-cursor-2',
        }),
      }

      mockApiClient.articles.$get.mockResolvedValueOnce(initialMockResponse)

      const { result } = renderHook(() => useTrends())

      // 初期化を待つ
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })

      mockApiClient.articles.$get.mockResolvedValueOnce(nextPageMockResponse)

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
      const initialMockResponse = {
        status: 200,
        json: vi.fn().mockResolvedValue({
          data: [],
          nextCursor: null,
          prevCursor: 'prev-cursor-initial',
        }),
      }

      const prevPageMockResponse = {
        status: 200,
        json: vi.fn().mockResolvedValue({
          data: [generateMockArticle({ articleId: BigInt(4), title: '記事4' })],
          nextCursor: 'next-cursor-3',
          prevCursor: 'prev-cursor-3',
        }),
      }

      mockApiClient.articles.$get.mockResolvedValueOnce(initialMockResponse)

      const { result } = renderHook(() => useTrends())

      // 初期化を待つ
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })

      mockApiClient.articles.$get.mockResolvedValueOnce(prevPageMockResponse)

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

      const { result } = renderHook(() => useTrends())

      // 初期化時にローディング状態になることを確認
      expect(result.current.isLoading).toBe(true)

      await act(async () => {
        resolvePromise!()
        await mockPromise
      })

      expect(result.current.isLoading).toBe(false)
    })

    it('limitを設定すると1度に取得できる記事の数を制限できる', async () => {
      const initialMockResponse = {
        status: 200,
        json: vi.fn().mockResolvedValue({
          data: [],
          nextCursor: null,
          prevCursor: null,
        }),
      }

      const limitMockResponse = {
        status: 200,
        json: vi.fn().mockResolvedValue({
          data: [],
          nextCursor: null,
          prevCursor: null,
        }),
      }

      mockApiClient.articles.$get.mockResolvedValueOnce(initialMockResponse)

      const { result } = renderHook(() => useTrends())

      // 初期化を待つ
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })

      mockApiClient.articles.$get.mockResolvedValueOnce(limitMockResponse)

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
      const mockResponse = {
        status: 200,
        json: vi.fn().mockResolvedValue({
          data: [generateMockArticle()].map((article) => ({
            ...article,
            articleId: article.articleId.toString(),
            createdAt: article.createdAt.toISOString(),
          })),
          nextCursor: 'updated-next-cursor',
          prevCursor: 'updated-prev-cursor',
        }),
      }

      mockApiClient.articles.$get.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useTrends())

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })

      expect(result.current.cursor.next).toBe('updated-next-cursor')
      expect(result.current.cursor.prev).toBe('updated-prev-cursor')
    })

    it('フック初期化が正常に完了する', async () => {
      mockApiClient.articles.$get.mockRejectedValue(new Error('Test Error'))

      expect(() => {
        const { result } = setupHook()
        expect(result.current).toBeDefined()
      }).not.toThrow()

      // 初期化の非同期処理を待つ
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })
    })

    describe('エッジケース', () => {
      it('記事が0件でも正しく処理される', async () => {
        const mockResponse = {
          status: 200,
          json: vi.fn().mockResolvedValue({
            data: [],
            nextCursor: null,
            prevCursor: null,
          }),
        }

        mockApiClient.articles.$get.mockResolvedValue(mockResponse)

        const { result } = renderHook(() => useTrends())

        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 0))
        })

        expect(result.current.articles).toEqual([])
        expect(result.current.cursor.next).toBeNull()
        expect(result.current.cursor.prev).toBeNull()
        expect(result.current.isLoading).toBe(false)
      })

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

        const { result } = renderHook(() => useTrends())

        // ローディング中であることを確認
        expect(result.current.isLoading).toBe(true)

        // ローディング中に再度fetchArticlesを呼び出し
        await act(async () => {
          await result.current.fetchArticles({
            date: new Date('2024-01-01'),
          })
        })

        // API呼び出しが1回のみであることを確認（初期化時のみ）
        expect(mockApiClient.articles.$get).toHaveBeenCalledTimes(1)

        await act(async () => {
          resolvePromise!()
          await mockPromise
        })

        expect(result.current.isLoading).toBe(false)
      })
    })

    describe('APIのエラーケース', () => {
      it('API呼び出しで400番台の時、エラーのtoastが表示される', async () => {
        const mockResponse = {
          status: 400,
        }

        mockApiClient.articles.$get.mockResolvedValue(mockResponse)

        const { result } = renderHook(() => useTrends())

        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 0))
        })

        expect(toast.error).toHaveBeenCalledWith('不正なパラメータです')
        expect(result.current.isLoading).toBe(false)
      })

      it('API呼び出しで500番台の時、エラーのtoastが表示される', async () => {
        const mockResponse = {
          status: 500,
        }

        mockApiClient.articles.$get.mockResolvedValue(mockResponse)

        const { result } = renderHook(() => useTrends())

        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 0))
        })

        expect(toast.error).toHaveBeenCalledWith('不明なエラーが発生しました')
        expect(result.current.isLoading).toBe(false)
      })

      it('その他のエラーの時、エラーのtoastが表示される', async () => {
        const otherErrorMessage = 'その他のエラーが発生しました'
        const networkError = new Error(otherErrorMessage)
        mockApiClient.articles.$get.mockRejectedValue(networkError)

        const { result } = renderHook(() => useTrends())

        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 0))
        })

        expect(toast.error).toHaveBeenCalledWith(otherErrorMessage)
        expect(result.current.isLoading).toBe(false)
      })
    })
  })
})
