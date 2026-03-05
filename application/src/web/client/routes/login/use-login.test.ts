import { act, renderHook } from '@testing-library/react'
import { toast } from 'sonner'
import useSWRMutation from 'swr/mutation'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import useLogin from './use-login'

vi.mock('swr/mutation', () => {
  return {
    default: vi.fn(),
  }
})

vi.mock('../../features/create-swr-fetcher', () => {
  return {
    createSWRFetcher: () => ({
      client: {
        v2: {
          auth: {
            login: {
              // biome-ignore lint/style/useNamingConvention: API client property
              $post: vi.fn(),
            },
          },
        },
      },
      apiCall: vi.fn(),
    }),
  }
})

type MutationOptions = {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

describe('useLogin', () => {
  const mockTrigger = vi.fn()
  const mockedUseSWRMutation = vi.mocked(useSWRMutation)

  beforeEach(() => {
    vi.clearAllMocks()
    mockTrigger.mockResolvedValue(undefined)
    mockedUseSWRMutation.mockReturnValue({
      trigger: mockTrigger,
      isMutating: false,
    } as never)
  })

  it('初期状態ではisLoadingがfalse', () => {
    const { result } = renderHook(() => useLogin(vi.fn()))

    expect(result.current.isLoading).toBe(false)
  })

  it('認証成功時はトースト表示後にトレンド画面へ遷移する', () => {
    const mockNavigate = vi.fn()
    renderHook(() => useLogin(mockNavigate))

    const options = mockedUseSWRMutation.mock.calls[0]?.[2] as MutationOptions
    options.onSuccess?.()

    expect(toast.success).toHaveBeenCalledWith('ログインしました')
    expect(mockNavigate).toHaveBeenCalledWith('/trends')
  })

  it('handleSubmitでtriggerを実行する', async () => {
    const { result } = renderHook(() => useLogin(vi.fn()))
    const formData = {
      email: 'test@example.com',
      password: 'password123',
    }

    await act(async () => {
      await result.current.handleSubmit(formData)
    })

    expect(mockTrigger).toHaveBeenCalledWith(formData)
  })

  it('401/404エラー時は認証エラートーストを表示する', () => {
    renderHook(() => useLogin(vi.fn()))

    const options = mockedUseSWRMutation.mock.calls[0]?.[2] as MutationOptions
    options.onError?.(new Error('HTTP 401: Unauthorized'))

    expect(toast.error).toHaveBeenCalledWith('メールアドレスまたはパスワードが正しくありません')
  })

  it('500エラー時はサーバーエラートーストを表示する', () => {
    renderHook(() => useLogin(vi.fn()))

    const options = mockedUseSWRMutation.mock.calls[0]?.[2] as MutationOptions
    options.onError?.(new Error('HTTP 500: Internal Server Error'))

    expect(toast.error).toHaveBeenCalledWith(
      'サーバーエラーが発生しました。時間をおいて再度お試しください。',
    )
  })

  it('想定外エラー時は汎用エラートーストを表示する', () => {
    renderHook(() => useLogin(vi.fn()))

    const options = mockedUseSWRMutation.mock.calls[0]?.[2] as MutationOptions
    options.onError?.(new Error('HTTP 418: I am a teapot'))

    expect(toast.error).toHaveBeenCalledWith('予期せぬエラーが発生しました。')
  })
})
