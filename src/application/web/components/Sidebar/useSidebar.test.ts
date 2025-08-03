import type { RenderHookResult } from '@testing-library/react'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import useSidebar from './useSidebar'

// モック設定
vi.mock('@react-router/react', () => {
  const mockNavigate = vi.fn()
  return {
    useNavigate: () => mockNavigate,
  }
})

vi.mock('sonner', () => {
  return {
    toast: {
      success: vi.fn(),
      error: vi.fn(),
    },
  }
})

vi.mock('swr/mutation', () => {
  const mockTrigger = vi.fn()
  return {
    default: () => ({
      trigger: mockTrigger,
      isMutating: false,
    }),
  }
})

vi.mock('../../features/createSWRFetcher', () => {
  const mockClient = {
    account: {
      logout: {
        // biome-ignore lint/style/useNamingConvention: API client property
        $delete: vi.fn(),
      },
    },
  }
  const mockApiCall = vi.fn()

  return {
    createSWRFetcher: () => ({
      client: mockClient,
      apiCall: mockApiCall,
    }),
  }
})

type UseSidebarHook = ReturnType<typeof useSidebar>

function setupHook(): RenderHookResult<UseSidebarHook, unknown> {
  return renderHook(() => useSidebar())
}

describe('useSidebar', () => {
  describe('基本動作', () => {
    it('初期状態ではisLoadingがfalseである', () => {
      const { result } = setupHook()

      expect(result.current.isLoading).toBe(false)
      expect(typeof result.current.handleLogout).toBe('function')
    })

    it('handleLogoutが呼び出せる', () => {
      const { result } = setupHook()

      act(() => {
        result.current.handleLogout()
      })

      // エラーが発生しないことを確認
      expect(result.current.handleLogout).toBeDefined()
    })
  })

  describe('エッジケース', () => {
    it('複数回handleLogoutを呼び出しても問題ない', () => {
      const { result } = setupHook()

      act(() => {
        result.current.handleLogout()
        result.current.handleLogout()
      })

      expect(result.current.handleLogout).toBeDefined()
    })
  })

  describe('境界値テスト', () => {
    it('フック初期化時の予期しないエラー', () => {
      // フックの初期化が正常に完了することを確認
      expect(() => {
        const { result } = setupHook()
        expect(result.current).toBeDefined()
      }).not.toThrow()
    })
  })
})
