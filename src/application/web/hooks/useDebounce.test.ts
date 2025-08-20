import type { RenderHookResult } from '@testing-library/react'
import { renderHook, waitFor } from '@testing-library/react'
import { useDebounce } from './useDebounce'

type UseDebounceHook = ReturnType<typeof useDebounce<string>>

function setupHook(
  initialValue: string = 'initial',
  delay: number = 500,
): RenderHookResult<UseDebounceHook, { value: string; delay: number }> {
  return renderHook(
    ({ value, delay }) => useDebounce(value, delay),
    {
      initialProps: { value: initialValue, delay },
    },
  )
}

describe('useDebounce', () => {
  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('基本動作', () => {
    it('初期値を即座に返す', () => {
      const { result } = setupHook('test', 300)
      
      expect(result.current).toBe('test')
    })

    it('値が変更されても遅延時間経過まで古い値を保持する', async () => {
      const { result, rerender } = setupHook('initial', 300)
      
      expect(result.current).toBe('initial')
      
      // 値を変更
      rerender({ value: 'updated', delay: 300 })
      
      // 遅延時間前は古い値のまま
      expect(result.current).toBe('initial')
    })

    it('遅延時間経過後に新しい値を返す', async () => {
      const { result, rerender } = setupHook('initial', 100)
      
      expect(result.current).toBe('initial')
      
      // 値を変更
      rerender({ value: 'updated', delay: 100 })
      
      // 遅延時間経過後に新しい値が設定される
      await waitFor(
        () => {
          expect(result.current).toBe('updated')
        },
        { timeout: 200 }
      )
    })
  })

  describe('連続変更のテスト', () => {
    it('値が連続で変更される場合、最後の値のみが反映される', async () => {
      const { result, rerender } = setupHook('initial', 200)
      
      expect(result.current).toBe('initial')
      
      // 短期間で連続変更
      rerender({ value: 'first', delay: 200 })
      rerender({ value: 'second', delay: 200 })
      rerender({ value: 'final', delay: 200 })
      
      // 遅延時間前は初期値のまま
      expect(result.current).toBe('initial')
      
      // 遅延時間経過後は最後の値が反映される
      await waitFor(
        () => {
          expect(result.current).toBe('final')
        },
        { timeout: 300 }
      )
    })

    it('短い間隔での変更では中間値をスキップする', async () => {
      const { result, rerender } = setupHook('initial', 150)
      
      // 50ms間隔で変更（遅延時間150msより短い）
      rerender({ value: 'step1', delay: 150 })
      
      await new Promise(resolve => setTimeout(resolve, 50))
      expect(result.current).toBe('initial')
      
      rerender({ value: 'step2', delay: 150 })
      
      await new Promise(resolve => setTimeout(resolve, 50))
      expect(result.current).toBe('initial')
      
      rerender({ value: 'final', delay: 150 })
      
      // step1、step2はスキップされ、finalのみが最終的に反映される
      await waitFor(
        () => {
          expect(result.current).toBe('final')
        },
        { timeout: 200 }
      )
    })
  })

  describe('遅延時間変更のテスト', () => {
    it('遅延時間が変更されると新しい遅延時間が適用される', async () => {
      const { result, rerender } = setupHook('initial', 100)
      
      // 値と遅延時間を同時に変更
      rerender({ value: 'updated', delay: 300 })
      
      // 短時間では変更されない
      await new Promise(resolve => setTimeout(resolve, 150))
      expect(result.current).toBe('initial')
      
      // 300ms後に変更される
      await waitFor(
        () => {
          expect(result.current).toBe('updated')
        },
        { timeout: 400 }
      )
    })
  })

  describe('型の多様性テスト', () => {
    it('number型の値を正しく処理する', async () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        {
          initialProps: { value: 0, delay: 100 },
        },
      )
      
      expect(result.current).toBe(0)
      
      rerender({ value: 42, delay: 100 })
      
      await waitFor(
        () => {
          expect(result.current).toBe(42)
        },
        { timeout: 200 }
      )
    })

    it('boolean型の値を正しく処理する', async () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        {
          initialProps: { value: false, delay: 100 },
        },
      )
      
      expect(result.current).toBe(false)
      
      rerender({ value: true, delay: 100 })
      
      await waitFor(
        () => {
          expect(result.current).toBe(true)
        },
        { timeout: 200 }
      )
    })
  })

  describe('クリーンアップ機能', () => {
    it('複数の値変更で最後の値のみが反映される', async () => {
      const { result, rerender } = setupHook('initial', 200)
      
      rerender({ value: 'first', delay: 200 })
      rerender({ value: 'second', delay: 200 })
      
      // 最後の値のみが反映される
      await waitFor(
        () => {
          expect(result.current).toBe('second')
        },
        { timeout: 300 }
      )
    })
  })
})