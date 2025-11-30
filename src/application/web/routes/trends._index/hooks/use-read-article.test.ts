import type { RenderHookResult } from '@testing-library/react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { type Result, isFailure, isSuccess } from '@yuukihayashi0510/core'
import { vi } from 'vitest'

// モックの定義
const mockMarkAsReadPost = vi.fn()
const mockMarkAsUnreadDelete = vi.fn()

vi.mock('../../../infrastructure/api', () => ({
  default: () => ({
    articles: {
      ':article_id': {
        read: {
          // biome-ignore lint/style/useNamingConvention: Honoクライアントライブラリの規約
          $post: mockMarkAsReadPost,
        },
        unread: {
          // biome-ignore lint/style/useNamingConvention: Honoクライアントライブラリの規約
          $delete: mockMarkAsUnreadDelete,
        },
      },
    },
  }),
}))

// テスト対象のインポートは必ずモック定義の後に行う
const { default: useReadArticle } = await import('./use-read-article')

type UseReadArticleHook = ReturnType<typeof useReadArticle>

function setupHook(): RenderHookResult<UseReadArticleHook, unknown> {
  return renderHook(() => useReadArticle())
}

describe('useReadArticle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('初期状態', () => {
    it('isLoadingがfalseである', () => {
      const { result } = setupHook()

      expect(result.current.isLoading).toBe(false)
      expect(typeof result.current.markAsRead).toBe('function')
      expect(typeof result.current.markAsUnread).toBe('function')
    })
  })

  describe('markAsRead', () => {
    it('既読登録に成功した場合、成功結果とメッセージを返す', async () => {
      const { result } = setupHook()
      const articleId = BigInt(1)

      mockMarkAsReadPost.mockResolvedValue({
        status: 201,
        json: async () => ({ message: '記事を既読にしました' }),
      })

      let apiResult: Result<string, Error>
      await act(async () => {
        apiResult = await result.current.markAsRead(articleId)
      })

      await waitFor(() => {
        expect(mockMarkAsReadPost).toHaveBeenCalledWith({
          param: { article_id: '1' },
          json: expect.objectContaining({
            read_at: expect.any(String),
          }),
        })
        expect(isSuccess(apiResult)).toBe(true)
        if (isSuccess(apiResult)) {
          expect(apiResult.data).toBe('記事を既読にしました')
        }
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('既読登録中はisLoadingがtrueになる', async () => {
      const { result } = setupHook()
      const articleId = BigInt(1)

      mockMarkAsReadPost.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  status: 201,
                  json: async () => ({ message: '記事を既読にしました' }),
                }),
              100,
            ),
          ),
      )

      act(() => {
        result.current.markAsRead(articleId)
      })

      // ローディング中
      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it.each([
      {
        status: 400,
        expectedError: '既読登録に失敗しました',
        description: 'クライアントエラー(4xx)',
      },
      {
        status: 404,
        expectedError: '既読登録に失敗しました',
        description: 'クライアントエラー(4xx)',
      },
      {
        status: 500,
        expectedError: 'サーバーエラーが発生しました',
        description: 'サーバーエラー(5xx)',
      },
    ])('$description の場合、エラー結果を返す', async ({ status, expectedError }) => {
      const { result } = setupHook()
      const articleId = BigInt(1)

      mockMarkAsReadPost.mockResolvedValue({
        status,
      })

      let apiResult: Result<string, Error>
      await act(async () => {
        apiResult = await result.current.markAsRead(articleId)
      })

      await waitFor(() => {
        expect(isFailure(apiResult)).toBe(true)
        if (isFailure(apiResult)) {
          expect(apiResult.error.message).toBe(expectedError)
        }
        expect(result.current.isLoading).toBe(false)
      })
    })
  })

  describe('markAsUnread', () => {
    it('未読登録に成功した場合、成功結果とメッセージを返す', async () => {
      const { result } = setupHook()
      const articleId = BigInt(1)

      mockMarkAsUnreadDelete.mockResolvedValue({
        status: 200,
        json: async () => ({ message: '記事を未読にしました' }),
      })

      let apiResult: Result<string, Error>
      await act(async () => {
        apiResult = await result.current.markAsUnread(articleId)
      })

      await waitFor(() => {
        expect(mockMarkAsUnreadDelete).toHaveBeenCalledWith({
          param: { article_id: '1' },
        })
        expect(isSuccess(apiResult)).toBe(true)
        if (isSuccess(apiResult)) {
          expect(apiResult.data).toBe('記事を未読にしました')
        }
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('未読登録中はisLoadingがtrueになる', async () => {
      const { result } = setupHook()
      const articleId = BigInt(1)

      mockMarkAsUnreadDelete.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  status: 200,
                  json: async () => ({ message: '記事を未読にしました' }),
                }),
              100,
            ),
          ),
      )

      act(() => {
        result.current.markAsUnread(articleId)
      })

      // ローディング中
      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it.each([
      {
        status: 400,
        expectedError: '未読登録に失敗しました',
        description: 'クライアントエラー(4xx)',
      },
      {
        status: 404,
        expectedError: '未読登録に失敗しました',
        description: 'クライアントエラー(4xx)',
      },
      {
        status: 500,
        expectedError: 'サーバーエラーが発生しました',
        description: 'サーバーエラー(5xx)',
      },
    ])('$description の場合、エラー結果を返す', async ({ status, expectedError }) => {
      const { result } = setupHook()
      const articleId = BigInt(1)

      mockMarkAsUnreadDelete.mockResolvedValue({
        status,
      })

      let apiResult: Result<string, Error>
      await act(async () => {
        apiResult = await result.current.markAsUnread(articleId)
      })

      await waitFor(() => {
        expect(isFailure(apiResult)).toBe(true)
        if (isFailure(apiResult)) {
          expect(apiResult.error.message).toBe(expectedError)
        }
        expect(result.current.isLoading).toBe(false)
      })
    })
  })
})
