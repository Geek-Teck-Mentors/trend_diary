import type { RenderHookResult } from '@testing-library/react'
import { act, renderHook } from '@testing-library/react'
import type { ArticleOutput } from '@/domain/article/schema/articleSchema'
import useArticleDrawer from './useArticleDrawer'

type UseArticleDrawerHook = ReturnType<typeof useArticleDrawer>

function setupHook(): RenderHookResult<UseArticleDrawerHook, unknown> {
  return renderHook(() => useArticleDrawer())
}

// ヘルパー関数：記事を開く操作
function openArticleDrawer(
  result: RenderHookResult<UseArticleDrawerHook, unknown>['result'],
  article: ArticleOutput,
): void {
  act(() => {
    result.current.open(article)
  })
}

// ヘルパー関数：ドロワーを閉じる操作
function closeArticleDrawer(result: RenderHookResult<UseArticleDrawerHook, unknown>['result']): void {
  act(() => {
    result.current.close()
  })
}

// テスト用のフェイク記事データ
const createFakeArticle = (id: number = 1, title: string = 'テスト記事'): ArticleOutput => ({
  articleId: BigInt(id),
  media: 'tech',
  title,
  author: 'テスト著者',
  description: 'テスト記事の説明文です',
  url: 'https://example.com/article',
  createdAt: new Date('2024-01-01T00:00:00Z'),
})



describe('useArticleDrawer', () => {
  describe('基本動作', () => {
    it('初期状態ではisOpenがfalse、selectedArticleがnullである', () => {
      const { result } = setupHook()

      expect(result.current.isOpen).toBe(false)
      expect(result.current.selectedArticle).toBeNull()
      expect(typeof result.current.open).toBe('function')
      expect(typeof result.current.close).toBe('function')
    })

    it('open関数で記事を選択してドロワーを開くことができる', () => {
      const { result } = setupHook()
      const fakeArticle = createFakeArticle()

      openArticleDrawer(result, fakeArticle)

      expect(result.current.isOpen).toBe(true)
      expect(result.current.selectedArticle).toEqual(fakeArticle)
    })

    it('close関数でドロワーを閉じて記事選択をクリアできる', () => {
      const { result } = setupHook()
      const fakeArticle = createFakeArticle()

      // まず記事を開く
      openArticleDrawer(result, fakeArticle)

      expect(result.current.isOpen).toBe(true)
      expect(result.current.selectedArticle).toEqual(fakeArticle)

      // ドロワーを閉じる
      closeArticleDrawer(result)

      expect(result.current.isOpen).toBe(false)
      expect(result.current.selectedArticle).toBeNull()
    })
  })

  describe('エッジケース', () => {
    it('複数回open関数を呼び出してもDrawerが開いた状態になる', () => {
      const { result } = setupHook()
      const fakeArticle1 = createFakeArticle(1, '記事1')
      const fakeArticle2 = createFakeArticle(2, '記事2')

      openArticleDrawer(result, fakeArticle1)

      expect(result.current.isOpen).toBe(true)
      expect(result.current.selectedArticle).toEqual(fakeArticle1)

      openArticleDrawer(result, fakeArticle2)

      expect(result.current.isOpen).toBe(true)
      expect(result.current.selectedArticle).toEqual(fakeArticle2)
    })

    it('複数回close関数を呼び出してもDrawerが閉じる', () => {
      const { result } = setupHook()
      const fakeArticle = createFakeArticle()

      // まず記事を開く
      openArticleDrawer(result, fakeArticle)

      // 複数回閉じる
      closeArticleDrawer(result)
      closeArticleDrawer(result)

      expect(result.current.isOpen).toBe(false)
      expect(result.current.selectedArticle).toBeNull()
    })

    it('close状態でclose関数を呼び出してもDrawerが閉じたままである', () => {
      const { result } = setupHook()

      closeArticleDrawer(result)

      expect(result.current.isOpen).toBe(false)
      expect(result.current.selectedArticle).toBeNull()
    })

    it('ある記事のDrawerを開いた状態で別の記事を開くとその記事に内容が置き換わる', () => {
      const { result } = setupHook()
      const fakeArticle1 = createFakeArticle(1, '技術記事')
      const fakeArticle2 = createFakeArticle(2, 'ビジネス記事')

      // 記事1を開く
      openArticleDrawer(result, fakeArticle1)

      expect(result.current.selectedArticle?.title).toBe('技術記事')

      // 記事2に切り替える
      openArticleDrawer(result, fakeArticle2)

      expect(result.current.selectedArticle?.title).toBe('ビジネス記事')

      // 閉じる
      closeArticleDrawer(result)

      expect(result.current.selectedArticle).toBeNull()
    })
  })
})
