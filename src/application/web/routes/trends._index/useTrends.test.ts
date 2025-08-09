import type { RenderHookResult } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, type MockedFunction, vi } from 'vitest'
import { getErrorMessage } from '@/common/errors'
import getApiClientForClient from '../../infrastructure/api'
import useTrends from './useTrends'

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
