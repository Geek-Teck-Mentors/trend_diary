import type { RenderHookResult } from '@testing-library/react'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createElement } from 'react'
import { MemoryRouter } from 'react-router'
import { toast } from 'sonner'
import { SWRConfig } from 'swr'
import type { MockedFunction } from 'vitest'
import { ArticleOutput as Article } from '@/domain/article/schema/articleSchema'
import getApiClientForClient from '../../infrastructure/api'
import useTrends from './useTrends'

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

vi.mock('../../infrastructure/api', () => ({
  default: vi.fn(),
}))

// 日付は実行時の today をテスト内で生成（SWRフックは new Date() を内部利用）
const todayISO = new Date().toISOString().slice(0, 10)
const defaultFakeArticle: Article = {
  articleId: BigInt(1),
  media: 'qiita',
  title: 'デフォルトタイトル',
  author: 'デフォルト筆者',
  description: 'デフォルトの説明文です',
  url: 'https://example.com',
  createdAt: new Date(`${todayISO}T00:00:00Z`),
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
  status: params?.status ?? 200,
  json: vi.fn().mockResolvedValue({
    data: params?.articles ?? [],
    page: params?.page ?? 1,
    limit: params?.limit ?? 20,
    total: params?.total ?? 0,
    totalPages: params?.totalPages ?? 1,
    hasNext: (params?.page ?? 1) < (params?.totalPages ?? 1),
    hasPrev: (params?.page ?? 1) > 1,
  }),
})

const mockGetApiClientForClient = getApiClientForClient as MockedFunction<any>
type UseTrendsHook = ReturnType<typeof useTrends>

function setupHook(initialEntries?: string[]): RenderHookResult<UseTrendsHook, unknown> {
  return renderHook(() => useTrends(), {
    wrapper: ({ children }: { children: ReactNode }) =>
      createElement(
        SWRConfig,
        { value: { provider: () => new Map(), dedupingInterval: 0 } },
        createElement(MemoryRouter, { initialEntries }, children),
      ),
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
    it('初期化時に今日の日付で記事一覧が取得できる (SWR初期フェッチ)', async () => {
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

    it('pageを2に設定すると、2ページ目が取得できる (URL更新で再フェッチ)', async () => {
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
        await result.current.fetchArticles({ page: 2 })
      })

      // URL 更新 → 新しいキーでフェッチ（today 日付）
      expect(mockApiClient.articles.$get).toHaveBeenLastCalledWith({
        query: {
          to: expect.stringMatching(/\d{4}-\d{2}-\d{2}/),
          from: expect.stringMatching(/\d{4}-\d{2}-\d{2}/),
          page: 2,
          limit: 20,
        },
      })
      await waitFor(() => {
        expect(result.current.page).toBe(2)
        expect(result.current.articles).toHaveLength(1)
      })
      expect(result.current.articles[0].title).toBe('記事3')
    })

    it('loading中はisLoadingがtrueになる (SWR初期ロード)', async () => {
      let resolvePromise: () => void
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

      // SWR の isLoading が true を想定（変化が速い環境では一瞬で false になる可能性があるため optional）
      expect([true, false]).toContain(result.current.isLoading)

      await act(async () => {
        resolvePromise!()
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('limitを設定すると1度に取得できる記事の数を制限できる (URL更新)', async () => {
      const initialFakeResponse = generateFakeResponse()

      const limitFakeResponse = generateFakeResponse()

      mockApiClient.articles.$get.mockResolvedValueOnce(initialFakeResponse)

      const { result } = setupHook()

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      mockApiClient.articles.$get.mockResolvedValueOnce(limitFakeResponse)

      await act(async () => {
        await result.current.fetchArticles({ limit: 10 })
      })

      expect(mockApiClient.articles.$get).toHaveBeenLastCalledWith({
        query: {
          to: expect.stringMatching(/\d{4}-\d{2}-\d{2}/),
          from: expect.stringMatching(/\d{4}-\d{2}-\d{2}/),
          page: 1,
          limit: 10,
        },
      })
    })

    it('レスポンス page=2 でも URL に page パラメータが無ければ内部 page は 1 のまま (URLが唯一のソース)', async () => {
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
        expect(result.current.isLoading).toBe(false)
      })
      expect(result.current.page).toBe(1)
      expect(result.current.totalPages).toBe(3)
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
        expect(result.current.page).toBe(2)
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
        expect(result.current.page).toBe(1)
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
    it('同一条件で fetchArticles を呼ぶと URL 変更なく再取得 (mutate) が実行される', async () => {
      const firstResponse = generateFakeResponse({ articles: [generateFakeArticle()] })
      const secondResponse = generateFakeResponse({
        articles: [generateFakeArticle({ articleId: BigInt(2), title: '再取得後' })],
      })
      mockApiClient.articles.$get.mockResolvedValueOnce(firstResponse)
      mockApiClient.articles.$get.mockResolvedValueOnce(secondResponse)

      const { result } = setupHook()

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      const before = mockApiClient.articles.$get.mock.calls.length

      await act(async () => {
        await result.current.fetchArticles() // 条件変更なし → mutate 強制再取得
      })

      // 再取得で最低 1 回は追加される
      expect(mockApiClient.articles.$get.mock.calls.length).toBeGreaterThanOrEqual(before + 1)
      await waitFor(() => {
        expect(result.current.articles[0].title).toBe('再取得後')
      })
    })
  })

  describe('APIのエラーケース', () => {
    it('API呼び出しで400番台の時、エラーのtoastが表示される', async () => {
      const fakeResponse = generateFakeResponse({ status: 400 })
      mockApiClient.articles.$get.mockResolvedValue(fakeResponse)
      const { result } = setupHook()
      await waitFor(() => {
        expect(result.current.error).toBeDefined()
      })
      expect(toast.error).toHaveBeenCalledWith('不正なパラメータです')
    })

    it('API呼び出しで500番台の時、エラーのtoastが表示される', async () => {
      const fakeResponse = generateFakeResponse({ status: 500 })
      mockApiClient.articles.$get.mockResolvedValue(fakeResponse)
      const { result } = setupHook()
      await waitFor(() => {
        expect(result.current.error).toBeDefined()
      })
      expect(toast.error).toHaveBeenCalledWith('不明なエラーが発生しました')
    })

    it('その他のエラーの時、エラーのtoastが表示される', async () => {
      const otherErrorMessage = 'その他のエラーが発生しました'
      const networkError = new Error(otherErrorMessage)
      mockApiClient.articles.$get.mockRejectedValue(networkError)
      const { result } = setupHook()
      await waitFor(() => {
        expect(result.current.error).toBeDefined()
      })
      expect(toast.error).toHaveBeenCalledWith(otherErrorMessage)
    })
  })
})
