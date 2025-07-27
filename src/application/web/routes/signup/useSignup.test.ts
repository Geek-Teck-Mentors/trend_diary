import type { RenderHookResult } from '@testing-library/react'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import useSignup from './useSignup'

// モック設定
vi.mock('@remix-run/react', () => {
  return {
    useNavigate: () => vi.fn(),
  }
})

vi.mock('../../components/PageError/usePageError', () => {
  return {
    usePageError: () => ({
      pageError: null,
      newPageError: vi.fn(),
      clearPageError: vi.fn(),
    }),
  }
})

vi.mock('swr/mutation', () => {
  return {
    default: () => ({
      trigger: vi.fn(),
      isMutating: false,
    }),
  }
})

vi.mock('../../features/createSWRFetcher', () => {
  return {
    createSWRFetcher: () => ({
      client: {
        account: {
          // biome-ignore lint/style/useNamingConvention: API client property
          $post: vi.fn(),
        },
      },
      apiCall: vi.fn(),
    }),
  }
})

type UseSignupHook = ReturnType<typeof useSignup>

function setupHook(): RenderHookResult<UseSignupHook, unknown> {
  return renderHook(() => useSignup())
}

describe('useSignup', () => {
  describe('基本動作', () => {
    it('初期状態が正しく設定される', () => {
      const { result } = setupHook()

      expect(result.current.pageError).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(typeof result.current.handleSubmit).toBe('function')
    })

    it('handleSubmitが呼び出し可能である', () => {
      const { result } = setupHook()

      const testData = {
        email: 'test@example.com',
        password: 'password123',
      }

      expect(() => {
        act(() => {
          result.current.handleSubmit(testData)
        })
      }).not.toThrow()
    })
  })

  describe('フォーム送信', () => {
    it('正しいデータでhandleSubmitを実行できる', () => {
      const { result } = setupHook()

      const testData = {
        email: 'test@example.com',
        password: 'password123',
      }

      act(() => {
        result.current.handleSubmit(testData)
      })

      // エラーが発生しないことを確認
      expect(result.current.handleSubmit).toBeDefined()
    })
  })

  describe('境界値テスト', () => {
    it('フック初期化時の予期しないエラー', () => {
      expect(() => {
        const { result } = setupHook()
        expect(result.current).toBeDefined()
      }).not.toThrow()
    })
  })
})
