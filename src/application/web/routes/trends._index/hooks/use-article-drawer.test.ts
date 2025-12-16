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

    it('open関数で記事IDを選択してドロワーを開くことができる', () => {
      const { result } = setupHook()
      const articleId = 'article-1'

      openArticleDrawer(result, articleId)

      expect(result.current.isOpen).toBe(true)
      expect(result.current.selectedArticleId).toBe(articleId)
    })

    it('close関数でドロワーを閉じて記事ID選択をクリアできる', () => {
      const { result } = setupHook()
      const articleId = 'article-1'

      openArticleDrawer(result, articleId)

      expect(result.current.isOpen).toBe(true)
      expect(result.current.selectedArticleId).toBe(articleId)

      closeArticleDrawer(result)

      expect(result.current.isOpen).toBe(false)
      expect(result.current.selectedArticleId).toBeNull()
    })
  })

  describe('エッジケース', () => {
    it('複数回open関数を呼び出してもDrawerが開いた状態になる', () => {
      const { result } = setupHook()
      const articleId1 = 'article-1'
      const articleId2 = 'article-2'

      openArticleDrawer(result, articleId1)

      expect(result.current.isOpen).toBe(true)
      expect(result.current.selectedArticleId).toBe(articleId1)

      openArticleDrawer(result, articleId2)

      expect(result.current.isOpen).toBe(true)
      expect(result.current.selectedArticleId).toBe(articleId2)
    })

    it('複数回close関数を呼び出してもDrawerが閉じる', () => {
      const { result } = setupHook()
      const articleId = 'article-1'

      openArticleDrawer(result, articleId)

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

    it('ある記事のDrawerを開いた状態で別の記事を開くとその記事IDに置き換わる', () => {
      const { result } = setupHook()
      const articleId1 = 'article-1'
      const articleId2 = 'article-2'

      openArticleDrawer(result, articleId1)

      expect(result.current.selectedArticleId).toBe(articleId1)

      openArticleDrawer(result, articleId2)

      expect(result.current.selectedArticleId).toBe(articleId2)

      closeArticleDrawer(result)

      expect(result.current.selectedArticleId).toBeNull()
    })
  })
})
