import type { RenderHookResult } from '@testing-library/react'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createElement } from 'react'
import { MemoryRouter } from 'react-router'
import { toast } from 'sonner'
import type { MockedFunction } from 'vitest'
import { ArticleOutput as Article } from '@/domain/article/schema/articleSchema'
import getApiClientForClient from '../../../infrastructure/api'
import useTrends from './use-trends'

// window.matchMediaのモック
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}))

vi.mock('../../../infrastructure/api', () => ({
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
    page: number
    limit: number
    total: number
    totalPages: number
  }>,
) => ({
  status: params?.status || 200,
  json: vi.fn().mockResolvedValue({
    data: params?.articles || [],
    page: params?.page || 1,
    limit: params?.limit || 20,
    total: params?.total || 0,
    totalPages: params?.totalPages || 1,
    hasNext: (params?.page || 1) < (params?.totalPages || 1),
    hasPrev: (params?.page || 1) > 1,
  }),
})

// biome-ignore lint/suspicious/noExplicitAny: getApiClientForClientの型が面倒なのでanyを使用
const mockGetApiClientForClient = getApiClientForClient as MockedFunction<any>
type UseTrendsHook = ReturnType<typeof useTrends>

function setupHook(initialEntries?: string[]): RenderHookResult<UseTrendsHook, unknown> {
  return renderHook(() => useTrends(), {
    wrapper: ({ children }: { children: ReactNode }) =>
      createElement(MemoryRouter, { initialEntries }, children),
  })
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
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
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
          page: 1,
          limit: 20,
        },
      })
      expect(result.current.articles[0].title).toBe('記事1')
      expect(result.current.page).toBe(1)
      expect(result.current.totalPages).toBe(1)
    })

    it('pageを2に設定すると、2ページ目が取得できる', async () => {
      const initialFakeResponse = generateFakeResponse({
        page: 1,
        totalPages: 3,
      })

      const nextPageFakeResponse = generateFakeResponse({
        articles: [generateFakeArticle({ articleId: BigInt(3), title: '記事3' })],
        page: 2,
        limit: 20,
        total: 50,
        totalPages: 3,
      })

      mockApiClient.articles.$get.mockResolvedValueOnce(initialFakeResponse)

      const { result } = setupHook()

      await waitFor(() => {
        expect(result.current.page).toBe(1)
      })

      mockApiClient.articles.$get.mockResolvedValueOnce(nextPageFakeResponse)

      await act(async () => {
        await result.current.fetchArticles({
          date: new Date('2024-01-01'),
          page: 2,
        })
      })

      expect(mockApiClient.articles.$get).toHaveBeenLastCalledWith({
        query: {
          to: '2024-01-01',
          from: '2024-01-01',
          page: 2,
          limit: 20,
        },
      })
      expect(result.current.articles).toHaveLength(1)
      expect(result.current.articles[0].title).toBe('記事3')
    })

    it('loading中はisLoadingがtrueになる', async () => {
      let resolvePromise: () => void
      // biome-ignore lint/suspicious/noExplicitAny:　getApiClientForClientの型が面倒なのでanyを使用
      const mockPromise = new Promise<any>((resolve) => {
        resolvePromise = () =>
          resolve({
            status: 200,
            json: () =>
              Promise.resolve({
                data: [],
                page: 1,
                limit: 20,
                total: 0,
                totalPages: 1,
                hasNext: false,
                hasPrev: false,
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
          page: 1,
          limit: 10,
        },
      })
    })

    it('記事一覧を取得したタイミングで、ページ情報が更新される', async () => {
      const fakeResponse = generateFakeResponse({
        articles: [generateFakeArticle()],
        page: 2,
        limit: 20,
        total: 50,
        totalPages: 3,
      })

      mockApiClient.articles.$get.mockResolvedValue(fakeResponse)

      const { result } = setupHook()

      await waitFor(() => {
        expect(result.current.page).toBe(2)
        expect(result.current.totalPages).toBe(3)
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
      expect(result.current.page).toBe(1)
      expect(result.current.totalPages).toBe(1)
    })

    it('URLパラメータにpage=2がある場合、初期表示で2ページ目を取得する', async () => {
      const fakeResponse = generateFakeResponse({
        articles: [generateFakeArticle({ articleId: BigInt(3), title: '2ページ目の記事' })],
        page: 2,
        totalPages: 3,
      })

      mockApiClient.articles.$get.mockResolvedValue(fakeResponse)

      const { result } = setupHook(['/?page=2'])

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockApiClient.articles.$get).toHaveBeenCalledWith({
        query: {
          to: expect.stringMatching(/\d{4}-\d{2}-\d{2}/),
          from: expect.stringMatching(/\d{4}-\d{2}-\d{2}/),
          page: 2,
          limit: 20,
        },
      })
      expect(result.current.page).toBe(2)
      expect(result.current.articles[0].title).toBe('2ページ目の記事')
    })

    it('URLパラメータのpageが不正な値の場合、page=1として扱う', async () => {
      const fakeResponse = generateFakeResponse()

      mockApiClient.articles.$get.mockResolvedValue(fakeResponse)

      const { result } = setupHook(['/?page=invalid'])

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockApiClient.articles.$get).toHaveBeenCalledWith({
        query: {
          to: expect.stringMatching(/\d{4}-\d{2}-\d{2}/),
          from: expect.stringMatching(/\d{4}-\d{2}-\d{2}/),
          page: 1,
          limit: 20,
        },
      })
    })
  })

  describe('エッジケース', () => {
    it('ローディング中に再度fetchArticlesを呼び出しても処理されない', async () => {
      let resolvePromise: () => void
      // biome-ignore lint/suspicious/noExplicitAny: getApiClientForClientの型が面倒なのでanyを使用
      const mockPromise = new Promise<any>((resolve) => {
        resolvePromise = () =>
          resolve({
            status: 200,
            json: () =>
              Promise.resolve({
                data: [],
                page: 1,
                limit: 20,
                total: 0,
                totalPages: 1,
                hasNext: false,
                hasPrev: false,
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

      const { result } = setupHook()

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(otherErrorMessage)
        expect(result.current.isLoading).toBe(false)
      })
    })
  })
})
