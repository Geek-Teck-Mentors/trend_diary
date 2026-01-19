import type { RenderHookResult } from '@testing-library/react'
import { act, renderHook } from '@testing-library/react'
import useArticleDrawer from './use-article-drawer'
type UseArticleDrawerHook = ReturnType<typeof useArticleDrawer>

function setupHook(): RenderHookResult<UseArticleDrawerHook, unknown> {
  return renderHook(() => useArticleDrawer())
}

function openArticleDrawer(
  result: RenderHookResult<UseArticleDrawerHook, unknown>['result'],
  articleId: string,
): void {
  act(() => {
    result.current.open(articleId)
  })
}

function closeArticleDrawer(
  result: RenderHookResult<UseArticleDrawerHook, unknown>['result'],
): void {
  act(() => {
    result.current.close()
  })
}

describe('useArticleDrawer', () => {
  describe('基本動作', () => {
    it('初期状態ではisOpenがfalse、selectedArticleIdがnullである', () => {
      const { result } = setupHook()

      expect(result.current.isOpen).toBe(false)
      expect(result.current.selectedArticleId).toBeNull()
      expect(typeof result.current.open).toBe('function')
      expect(typeof result.current.close).toBe('function')
    })

    it('open関数で記事を選択してドロワーを開くことができる', () => {
      const { result } = setupHook()
      const fakeArticleId = '1'

      openArticleDrawer(result, fakeArticleId)

      expect(result.current.isOpen).toBe(true)
      expect(result.current.selectedArticleId).toBe(fakeArticleId)
    })

    it('close関数でドロワーを閉じて記事選択をクリアできる', () => {
      const { result } = setupHook()
      const fakeArticleId = '1'

      openArticleDrawer(result, fakeArticleId)

      expect(result.current.isOpen).toBe(true)
      expect(result.current.selectedArticleId).toBe(fakeArticleId)

      closeArticleDrawer(result)

      expect(result.current.isOpen).toBe(false)
      expect(result.current.selectedArticleId).toBeNull()
    })
  })

  describe('エッジケース', () => {
    it('複数回open関数を呼び出してもDrawerが開いた状態になる', () => {
      const { result } = setupHook()
      const fakeArticleId1 = '1'
      const fakeArticleId2 = '2'

      openArticleDrawer(result, fakeArticleId1)

      expect(result.current.isOpen).toBe(true)
      expect(result.current.selectedArticleId).toBe(fakeArticleId1)

      openArticleDrawer(result, fakeArticleId2)

      expect(result.current.isOpen).toBe(true)
      expect(result.current.selectedArticleId).toBe(fakeArticleId2)
    })

    it('複数回close関数を呼び出してもDrawerが閉じる', () => {
      const { result } = setupHook()
      const fakeArticleId = '1'

      openArticleDrawer(result, fakeArticleId)

      closeArticleDrawer(result)
      closeArticleDrawer(result)

      expect(result.current.isOpen).toBe(false)
      expect(result.current.selectedArticleId).toBeNull()
    })

    it('close状態でclose関数を呼び出してもDrawerが閉じたままである', () => {
      const { result } = setupHook()

      closeArticleDrawer(result)

      expect(result.current.isOpen).toBe(false)
      expect(result.current.selectedArticleId).toBeNull()
    })

    it('ある記事のDrawerを開いた状態で別の記事を開くとその記事に内容が置き換わる', () => {
      const { result } = setupHook()
      const fakeArticleId1 = '1'
      const fakeArticleId2 = '2'

      openArticleDrawer(result, fakeArticleId1)

      expect(result.current.selectedArticleId).toBe(fakeArticleId1)

      openArticleDrawer(result, fakeArticleId2)

      expect(result.current.selectedArticleId).toBe(fakeArticleId2)

      closeArticleDrawer(result)

      expect(result.current.selectedArticleId).toBeNull()
    })
  })
})
