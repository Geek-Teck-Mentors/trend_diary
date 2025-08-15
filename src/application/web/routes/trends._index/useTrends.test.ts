import type { RenderHookResult } from '@testing-library/react'
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, type MockedFunction, vi } from 'vitest'
import { getErrorMessage } from '@/common/errors'
import getApiClientForClient from '../../infrastructure/api'
import useTrends from './useTrends'
import { ArticleOutput as Article } from '@/domain/article/schema/articleSchema'

// Mocks
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}))

vi.mock('@/common/errors', () => ({
  getErrorMessage: vi.fn(),
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

// Mock types
const mockGetErrorMessage = getErrorMessage as MockedFunction<(error: unknown) => string | null>

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
    mockGetErrorMessage.mockReturnValue('エラーが発生しました')
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('基本動作', () => {
    it('初期状態が正しく設定される', () => {
      // API呼び出しが失敗しても初期状態は確認できる
      mockApiClient.articles.$get.mockRejectedValue(new Error('Test Error'))

      const { result } = setupHook()

      // 初期状態の確認（useEffect実行前）
      expect(result.current.articles).toEqual([])
      expect(result.current.cursor).toEqual({})
      expect(result.current.date).toBeInstanceOf(Date)
      expect(typeof result.current.fetchArticles).toBe('function')
    })
  })

  describe('エッジケース', () => {
    it('fetchArticles関数の型とプロパティ確認', () => {
      mockApiClient.articles.$get.mockRejectedValue(new Error('Test Error'))

      const { result } = setupHook()

      // fetchArticles関数が正しく定義されていることを確認
      expect(typeof result.current.fetchArticles).toBe('function')
      expect(result.current.fetchArticles.length).toBe(1) // 引数1つを受け取る
    })
  })

  describe('API成功ケース', () => {
    it('fetchArticlesが成功した場合、articlesとcursorの状態が正しく更新される', async () => {
      const title1 = 'テスト記事1'
      const title2 = 'テスト記事2'

      const mockApiData = [
        generateMockArticle({title: title1}),
        generateMockArticle({title: title2})
      ]
      const mockResponse = {
        status: 200,
        json: vi.fn().mockResolvedValue({
          data: mockApiData,
          nextCursor: 'next_123',
          prevCursor: 'prev_123'
        })
      }

      mockApiClient.articles.$get.mockResolvedValue(mockResponse)

      const { result } = setupHook()

      // fetchArticlesを呼び出し
      await act(async () => {
        await result.current.fetchArticles({ date: new Date('2024-01-01') })
      })

      // articlesとcursorが正しく更新されることを確認
      expect(result.current.articles).toHaveLength(2)
      expect(result.current.articles[0].title).toBe(title1)
      expect(result.current.articles[1].title).toBe(title2)
      expect(result.current.cursor).toEqual({
        next: 'next_123',
        prev: 'prev_123'
      })
      expect(result.current.isLoading).toBe(false)
    })

    it('空のレスポンスでも正しく処理される', async () => {
      const mockResponse = {
        status: 200,
        json: vi.fn().mockResolvedValue({
          data: [],
          nextCursor: null,
          prevCursor: null
        })
      }

      mockApiClient.articles.$get.mockResolvedValue(mockResponse)

      const { result } = setupHook()

      await act(async () => {
        await result.current.fetchArticles({ date: new Date('2024-01-01') })
      })

      expect(result.current.articles).toEqual([])
      expect(result.current.cursor).toEqual({
        next: null,
        prev: null
      })
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('境界値テスト', () => {
    it('フック初期化時の予期しないエラー', () => {
      mockApiClient.articles.$get.mockRejectedValue(new Error('Test Error'))

      expect(() => {
        const { result } = setupHook()
        expect(result.current).toBeDefined()
      }).not.toThrow()
    })

    it('返される値の構造確認', () => {
      mockApiClient.articles.$get.mockRejectedValue(new Error('Test Error'))

      const { result } = setupHook()

      // 返される値の構造を確認
      expect(result.current).toHaveProperty('date')
      expect(result.current).toHaveProperty('articles')
      expect(result.current).toHaveProperty('fetchArticles')
      expect(result.current).toHaveProperty('cursor')
      expect(result.current).toHaveProperty('isLoading')

      // 各プロパティの型確認
      expect(result.current.date).toBeInstanceOf(Date)
      expect(Array.isArray(result.current.articles)).toBe(true)
      expect(typeof result.current.fetchArticles).toBe('function')
      expect(typeof result.current.cursor).toBe('object')
      expect(typeof result.current.isLoading).toBe('boolean')
    })
  })
})
