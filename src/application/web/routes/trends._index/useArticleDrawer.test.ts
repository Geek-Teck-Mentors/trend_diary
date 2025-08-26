import type { RenderHookResult } from '@testing-library/react'
import { act, renderHook } from '@testing-library/react'
import type { ArticleOutput as Article } from '@/domain/article/schema/articleSchema'
import useArticleDrawer from './useArticleDrawer'

type UseArticleDrawerHook = ReturnType<typeof useArticleDrawer>

function setupHook(): RenderHookResult<UseArticleDrawerHook, unknown> {
  return renderHook(() => useArticleDrawer())
}

// テスト用のモック記事データ
const createMockArticle = (id: number = 1, title: string = 'テスト記事'): Article => ({
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
      const mockArticle = createMockArticle()

      act(() => {
        result.current.open(mockArticle)
      })

      expect(result.current.isOpen).toBe(true)
      expect(result.current.selectedArticle).toEqual(mockArticle)
    })

    it('close関数でドロワーを閉じて記事選択をクリアできる', () => {
      const { result } = setupHook()
      const mockArticle = createMockArticle()

      // まず記事を開く
      act(() => {
        result.current.open(mockArticle)
      })

      expect(result.current.isOpen).toBe(true)
      expect(result.current.selectedArticle).toEqual(mockArticle)

      // ドロワーを閉じる
      act(() => {
        result.current.close()
      })

      expect(result.current.isOpen).toBe(false)
      expect(result.current.selectedArticle).toBeNull()
    })
  })

  describe('エッジケース', () => {
    it('複数回open関数を呼び出しても正常に動作する', () => {
      const { result } = setupHook()
      const mockArticle1 = createMockArticle(1, '記事1')
      const mockArticle2 = createMockArticle(2, '記事2')

      act(() => {
        result.current.open(mockArticle1)
      })

      expect(result.current.isOpen).toBe(true)
      expect(result.current.selectedArticle).toEqual(mockArticle1)

      act(() => {
        result.current.open(mockArticle2)
      })

      expect(result.current.isOpen).toBe(true)
      expect(result.current.selectedArticle).toEqual(mockArticle2)
    })

    it('複数回close関数を呼び出しても問題ない', () => {
      const { result } = setupHook()
      const mockArticle = createMockArticle()

      // まず記事を開く
      act(() => {
        result.current.open(mockArticle)
      })

      // 複数回閉じる
      act(() => {
        result.current.close()
        result.current.close()
      })

      expect(result.current.isOpen).toBe(false)
      expect(result.current.selectedArticle).toBeNull()
    })

    it('close状態でclose関数を呼び出しても問題ない', () => {
      const { result } = setupHook()

      act(() => {
        result.current.close()
      })

      expect(result.current.isOpen).toBe(false)
      expect(result.current.selectedArticle).toBeNull()
    })

    it('異なる記事での操作が正常に動作する', () => {
      const { result } = setupHook()
      const mockArticle1 = createMockArticle(1, '技術記事')
      const mockArticle2 = createMockArticle(2, 'ビジネス記事')

      // 記事1を開く
      act(() => {
        result.current.open(mockArticle1)
      })

      expect(result.current.selectedArticle?.title).toBe('技術記事')

      // 記事2に切り替える
      act(() => {
        result.current.open(mockArticle2)
      })

      expect(result.current.selectedArticle?.title).toBe('ビジネス記事')

      // 閉じる
      act(() => {
        result.current.close()
      })

      expect(result.current.selectedArticle).toBeNull()
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

    it('極端に大きなIDの記事でも正常に動作する', () => {
      const { result } = setupHook()
      const mockArticle = createMockArticle(Number.MAX_SAFE_INTEGER, '極端な記事')

      act(() => {
        result.current.open(mockArticle)
      })

      expect(result.current.isOpen).toBe(true)
      expect(result.current.selectedArticle?.articleId).toBe(BigInt(Number.MAX_SAFE_INTEGER))
    })

    it('空文字列のタイトルを持つ記事でも正常に動作する', () => {
      const { result } = setupHook()
      const mockArticle = createMockArticle(1, '')

      act(() => {
        result.current.open(mockArticle)
      })

      expect(result.current.isOpen).toBe(true)
      expect(result.current.selectedArticle?.title).toBe('')
    })

    it('連続したopen/close操作でも状態が一貫している', () => {
      const { result } = setupHook()
      const mockArticle = createMockArticle()

      // 連続操作
      act(() => {
        result.current.open(mockArticle)
        result.current.close()
        result.current.open(mockArticle)
        result.current.close()
      })

      expect(result.current.isOpen).toBe(false)
      expect(result.current.selectedArticle).toBeNull()
    })
  })
})
