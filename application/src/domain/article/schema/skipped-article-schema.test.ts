import { describe, expect, it } from 'vitest'
import { skippedArticleSchema } from './skipped-article-schema'

describe('skippedArticleSchema', () => {
  const validData = {
    skippedArticleId: 1n,
    activeUserId: 10n,
    articleId: 100n,
    createdAt: new Date('2026-03-07T08:00:00.000Z'),
  }

  describe('正常系', () => {
    it('有効なスキップ済み記事データを受け入れること', () => {
      const result = skippedArticleSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('異常系', () => {
    it('skippedArticleIdがbigintでない場合に検証失敗すること', () => {
      const result = skippedArticleSchema.safeParse({ ...validData, skippedArticleId: 1 })
      expect(result.success).toBe(false)
    })

    it('activeUserIdがbigintでない場合に検証失敗すること', () => {
      const result = skippedArticleSchema.safeParse({ ...validData, activeUserId: '10' })
      expect(result.success).toBe(false)
    })

    it('articleIdがbigintでない場合に検証失敗すること', () => {
      const result = skippedArticleSchema.safeParse({ ...validData, articleId: 100 })
      expect(result.success).toBe(false)
    })

    it('createdAtがDate型でない場合に検証失敗すること', () => {
      const result = skippedArticleSchema.safeParse({ ...validData, createdAt: '2026-03-07' })
      expect(result.success).toBe(false)
    })

    it('必須フィールドが欠落している場合に検証失敗すること', () => {
      const { skippedArticleId: _skippedArticleId, ...withoutId } = validData
      const result = skippedArticleSchema.safeParse(withoutId)
      expect(result.success).toBe(false)
    })
  })
})
