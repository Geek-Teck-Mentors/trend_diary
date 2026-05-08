import { describe, expect, it } from 'vitest'
import { readHistorySchema } from './read-history-schema'

describe('readHistorySchema', () => {
  const validData = {
    readHistoryId: 1n,
    activeUserId: 10n,
    articleId: 100n,
    readAt: new Date('2026-03-07T08:00:00.000Z'),
    createdAt: new Date('2026-03-07T08:00:00.000Z'),
  }

  describe('正常系', () => {
    it('有効な読了履歴データを受け入れること', () => {
      const result = readHistorySchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('異常系', () => {
    it('readHistoryIdがbigintでない場合に検証失敗すること', () => {
      const result = readHistorySchema.safeParse({ ...validData, readHistoryId: 1 })
      expect(result.success).toBe(false)
    })

    it('activeUserIdがbigintでない場合に検証失敗すること', () => {
      const result = readHistorySchema.safeParse({ ...validData, activeUserId: '10' })
      expect(result.success).toBe(false)
    })

    it('articleIdがbigintでない場合に検証失敗すること', () => {
      const result = readHistorySchema.safeParse({ ...validData, articleId: 100 })
      expect(result.success).toBe(false)
    })

    it('readAtがDate型でない場合に検証失敗すること', () => {
      const result = readHistorySchema.safeParse({ ...validData, readAt: '2026-03-07' })
      expect(result.success).toBe(false)
    })

    it('createdAtがDate型でない場合に検証失敗すること', () => {
      const result = readHistorySchema.safeParse({ ...validData, createdAt: '2026-03-07' })
      expect(result.success).toBe(false)
    })

    it('必須フィールドが欠落している場合に検証失敗すること', () => {
      const { readHistoryId: _readHistoryId, ...withoutId } = validData
      const result = readHistorySchema.safeParse(withoutId)
      expect(result.success).toBe(false)
    })
  })
})
