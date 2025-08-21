import type { RenderHookResult } from '@testing-library/react'
import { act, renderHook } from '@testing-library/react'
import { useDebounce } from './useDebounce'

type UseDebounceHook<T> = ReturnType<typeof useDebounce<T>>

function setupHook<T>(
  initialValue: T,
  delay: number = 500,
): RenderHookResult<UseDebounceHook<T>, { value: T; delay: number }> {
  return renderHook(({ value, delay }) => useDebounce(value, delay), {
    initialProps: { value: initialValue, delay },
  })
}

describe('useDebounce', () => {
  beforeAll(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.clearAllTimers()
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  describe('基本動作', () => {
    it('初期値を即座に返す', () => {
      const { result } = setupHook('test', 300)

      expect(result.current).toBe('test')
    })

    it('値が変更されても遅延時間経過まで古い値を保持する', () => {
      const { result, rerender } = setupHook('initial', 300)

      expect(result.current).toBe('initial')

      rerender({ value: 'updated', delay: 300 })

      expect(result.current).toBe('initial')
    })

    it('遅延時間経過後に新しい値を返す', () => {
      const { result, rerender } = setupHook('initial', 100)

      expect(result.current).toBe('initial')

      rerender({ value: 'updated', delay: 100 })
      expect(result.current).toBe('initial')

      act(() => {
        vi.advanceTimersByTime(100)
      })
      expect(result.current).toBe('updated')
    })
  })

  describe('連続変更のテスト', () => {
    it('値が連続で変更される場合、最後の値のみが反映される', () => {
      const { result, rerender } = setupHook('initial', 200)

      expect(result.current).toBe('initial')

      rerender({ value: 'first', delay: 200 })
      rerender({ value: 'second', delay: 200 })
      rerender({ value: 'final', delay: 200 })
      expect(result.current).toBe('initial')

      act(() => {
        vi.advanceTimersByTime(200)
      })
      expect(result.current).toBe('final')
    })

    it('短い間隔での変更では中間値をスキップする', () => {
      const { result, rerender } = setupHook('initial', 150)

      rerender({ value: 'step1', delay: 150 })

      act(() => {
        vi.advanceTimersByTime(50)
      })
      expect(result.current).toBe('initial')

      rerender({ value: 'step2', delay: 150 })

      act(() => {
        vi.advanceTimersByTime(50)
      })
      expect(result.current).toBe('initial')

      rerender({ value: 'final', delay: 150 })

      act(() => {
        vi.advanceTimersByTime(150)
      })
      expect(result.current).toBe('final')
    })
  })

  describe('遅延時間変更のテスト', () => {
    it('遅延時間が変更されると新しい遅延時間が適用される', () => {
      const { result, rerender } = setupHook('initial', 100)

      rerender({ value: 'updated', delay: 300 })

      act(() => {
        vi.advanceTimersByTime(150)
      })
      expect(result.current).toBe('initial')

      act(() => {
        vi.advanceTimersByTime(150)
      })
      expect(result.current).toBe('updated')
    })
  })

  describe('型の多様性テスト', () => {
    it('number型の値を正しく処理する', () => {
      const { result, rerender } = setupHook(0, 100)

      expect(result.current).toBe(0)

      rerender({ value: 42, delay: 100 })

      act(() => {
        vi.advanceTimersByTime(100)
      })
      expect(result.current).toBe(42)
    })

    it('boolean型の値を正しく処理する', () => {
      const { result, rerender } = setupHook(false, 100)

      expect(result.current).toBe(false)

      rerender({ value: true, delay: 100 })

      act(() => {
        vi.advanceTimersByTime(100)
      })
      expect(result.current).toBe(true)
    })
  })
})
