import type { RenderHookResult } from '@testing-library/react'
import { act, renderHook, waitFor } from '@testing-library/react'
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

// toastのモック
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// テスト対象のインポートは必ずモック定義の後に行う
const { default: useReadArticle } = await import('./use-read-article')
const { toast } = await import('sonner')

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
    it('既読登録に成功した場合、成功メッセージを表示する', async () => {
      const { result } = setupHook()
      const articleId = BigInt(1)

      mockMarkAsReadPost.mockResolvedValue({
        status: 201,
        json: async () => ({ message: '記事を既読にしました' }),
      })

      await act(async () => {
        await result.current.markAsRead(articleId)
      })

      await waitFor(() => {
        expect(mockMarkAsReadPost).toHaveBeenCalledWith({
          param: { article_id: '1' },
          json: expect.objectContaining({
            read_at: expect.any(String),
          }),
        })
        expect(toast.success).toHaveBeenCalledWith('記事を既読にしました')
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

    it('既読登録に失敗した場合(4xx)、エラーメッセージを表示する', async () => {
      const { result } = setupHook()
      const articleId = BigInt(1)

      mockMarkAsReadPost.mockResolvedValue({
        status: 400,
      })

      await act(async () => {
        try {
          await result.current.markAsRead(articleId)
        } catch {
          // エラーは期待通り
        }
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('既読登録に失敗しました')
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('サーバーエラーの場合(5xx)、エラーメッセージを表示する', async () => {
      const { result } = setupHook()
      const articleId = BigInt(1)

      mockMarkAsReadPost.mockResolvedValue({
        status: 500,
      })

      await act(async () => {
        try {
          await result.current.markAsRead(articleId)
        } catch {
          // エラーは期待通り
        }
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('サーバーエラーが発生しました')
        expect(result.current.isLoading).toBe(false)
      })
    })
  })

  describe('markAsUnread', () => {
    it('未読登録に成功した場合、成功メッセージを表示する', async () => {
      const { result } = setupHook()
      const articleId = BigInt(1)

      mockMarkAsUnreadDelete.mockResolvedValue({
        status: 200,
        json: async () => ({ message: '記事を未読にしました' }),
      })

      await act(async () => {
        await result.current.markAsUnread(articleId)
      })

      await waitFor(() => {
        expect(mockMarkAsUnreadDelete).toHaveBeenCalledWith({
          param: { article_id: '1' },
        })
        expect(toast.success).toHaveBeenCalledWith('記事を未読にしました')
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

    it('未読登録に失敗した場合(4xx)、エラーメッセージを表示する', async () => {
      const { result } = setupHook()
      const articleId = BigInt(1)

      mockMarkAsUnreadDelete.mockResolvedValue({
        status: 404,
      })

      await act(async () => {
        try {
          await result.current.markAsUnread(articleId)
        } catch {
          // エラーは期待通り
        }
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('未読登録に失敗しました')
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('サーバーエラーの場合(5xx)、エラーメッセージを表示する', async () => {
      const { result } = setupHook()
      const articleId = BigInt(1)

      mockMarkAsUnreadDelete.mockResolvedValue({
        status: 500,
      })

      await act(async () => {
        try {
          await result.current.markAsUnread(articleId)
        } catch {
          // エラーは期待通り
        }
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('サーバーエラーが発生しました')
        expect(result.current.isLoading).toBe(false)
      })
    })
  })
})
