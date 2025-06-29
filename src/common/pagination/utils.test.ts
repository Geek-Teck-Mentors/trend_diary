import { describe, expect, it } from 'vitest'
import { createPaginationResult, decodeCursor, encodeCursor } from './utils'

const mockArticle = (id: number, createdAt: Date) => ({
  articleId: BigInt(id),
  createdAt,
  title: `Article ${id}`,
  author: 'Author',
  description: 'Description',
  url: 'https://example.com',
  media: 'qiita' as const,
})

describe('Pagination Utils', () => {
  describe('encodeCursor/decodeCursor', () => {
    it('cursorの正常なエンコード/デコード', () => {
      const cursorInfo = {
        id: BigInt(123),
        createdAt: new Date('2024-01-01T00:00:00Z'),
      }

      const encoded = encodeCursor(cursorInfo)
      const decoded = decodeCursor(encoded)

      expect(decoded.id).toBe(cursorInfo.id)
      expect(decoded.createdAt).toEqual(cursorInfo.createdAt)
    })

    it('不正なcursorでエラー', () => {
      expect(() => decodeCursor('invalid-cursor')).toThrow('Invalid cursor format')
    })
  })

  describe('createPaginationResult', () => {
    const baseDate = new Date('2024-01-01T00:00:00Z')

    it('次ページ方向の結果生成（hasMore = true, hasCursor = true）', () => {
      const articles = Array.from({ length: 3 }, (_, i) =>
        mockArticle(i + 1, new Date(baseDate.getTime() + i * 1000)),
      )

      const result = createPaginationResult(
        articles,
        2,
        (article) => article.articleId,
        'next',
        true,
      )

      expect(result.data).toHaveLength(2)
      expect(result.hasNext).toBe(true)
      expect(result.hasPrev).toBe(true)
      expect(result.nextCursor).toBeDefined()
      expect(result.prevCursor).toBeDefined()
    })

    it('初回ページ（hasCursor = false）', () => {
      const articles = [mockArticle(1, baseDate)]

      const result = createPaginationResult(
        articles,
        2,
        (article) => article.articleId,
        'next',
        false,
      )

      expect(result.data).toHaveLength(1)
      expect(result.hasNext).toBe(false)
      expect(result.hasPrev).toBe(false)
      expect(result.nextCursor).toBeUndefined()
      expect(result.prevCursor).toBeUndefined()
    })

    it('次ページ方向の結果生成（hasMore = false, hasCursor = true）', () => {
      const articles = [mockArticle(1, baseDate)]

      const result = createPaginationResult(
        articles,
        2,
        (article) => article.articleId,
        'next',
        true,
      )

      expect(result.data).toHaveLength(1)
      expect(result.hasNext).toBe(false)
      expect(result.hasPrev).toBe(true)
      expect(result.nextCursor).toBeUndefined()
      expect(result.prevCursor).toBeDefined()
    })

    it('前ページ方向の結果生成', () => {
      const articles = Array.from({ length: 3 }, (_, i) =>
        mockArticle(i + 1, new Date(baseDate.getTime() + i * 1000)),
      )

      const result = createPaginationResult(articles, 2, (article) => article.articleId, 'prev')

      expect(result.data).toHaveLength(2)
      expect(result.hasPrev).toBe(true)
      expect(result.hasNext).toBe(true)
      expect(result.nextCursor).toBeDefined()
      expect(result.prevCursor).toBeDefined()
    })

    it('空配列の場合', () => {
      const result = createPaginationResult<ReturnType<typeof mockArticle>>(
        [],
        2,
        (article) => article.articleId,
        'next',
      )

      expect(result.data).toHaveLength(0)
      expect(result.hasNext).toBe(false)
      expect(result.hasPrev).toBe(false)
      expect(result.nextCursor).toBeUndefined()
      expect(result.prevCursor).toBeUndefined()
    })
  })
})
