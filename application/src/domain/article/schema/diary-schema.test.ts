import { describe, expect, it } from 'vitest'
import { diaryReadItemSchema, diarySourceSchema, diarySummarySchema } from './diary-schema'

describe('diarySummarySchema', () => {
  describe('正常系', () => {
    it('読了数とスキップ数が0の場合に検証成功すること', () => {
      const result = diarySummarySchema.safeParse({ read: 0, skip: 0 })
      expect(result.success).toBe(true)
    })

    it('正の整数値を受け入れること', () => {
      const result = diarySummarySchema.safeParse({ read: 10, skip: 5 })
      expect(result.success).toBe(true)
    })
  })

  describe('異常系', () => {
    it('readが負の整数の場合に検証失敗すること', () => {
      const result = diarySummarySchema.safeParse({ read: -1, skip: 0 })
      expect(result.success).toBe(false)
    })

    it('skipが負の整数の場合に検証失敗すること', () => {
      const result = diarySummarySchema.safeParse({ read: 0, skip: -1 })
      expect(result.success).toBe(false)
    })

    it('readが小数の場合に検証失敗すること', () => {
      const result = diarySummarySchema.safeParse({ read: 1.5, skip: 0 })
      expect(result.success).toBe(false)
    })

    it('readが文字列の場合に検証失敗すること', () => {
      const result = diarySummarySchema.safeParse({ read: '1', skip: 0 })
      expect(result.success).toBe(false)
    })

    it('readフィールドが欠けている場合に検証失敗すること', () => {
      const result = diarySummarySchema.safeParse({ skip: 0 })
      expect(result.success).toBe(false)
    })

    it('skipフィールドが欠けている場合に検証失敗すること', () => {
      const result = diarySummarySchema.safeParse({ read: 0 })
      expect(result.success).toBe(false)
    })
  })
})

describe('diarySourceSchema', () => {
  describe('正常系', () => {
    it.each(['qiita', 'zenn', 'hatena'])(
      'media=%s で有効な集計データを受け入れること',
      (media) => {
        const result = diarySourceSchema.safeParse({ media, read: 1, skip: 1 })
        expect(result.success).toBe(true)
      },
    )
  })

  describe('異常系', () => {
    it('mediaが許可リストにない場合に検証失敗すること', () => {
      const result = diarySourceSchema.safeParse({ media: 'note', read: 1, skip: 1 })
      expect(result.success).toBe(false)
    })

    it('readが負の整数の場合に検証失敗すること', () => {
      const result = diarySourceSchema.safeParse({ media: 'qiita', read: -1, skip: 0 })
      expect(result.success).toBe(false)
    })

    it('skipが負の整数の場合に検証失敗すること', () => {
      const result = diarySourceSchema.safeParse({ media: 'qiita', read: 0, skip: -1 })
      expect(result.success).toBe(false)
    })
  })
})

describe('diaryReadItemSchema', () => {
  const validReadItem = {
    readHistoryId: 1n,
    articleId: 10n,
    media: 'qiita' as const,
    title: 'Sample title',
    url: 'https://example.com/sample',
    readAt: new Date('2026-03-07T08:00:00.000Z'),
  }

  describe('正常系', () => {
    it('有効な読了履歴アイテムを受け入れること', () => {
      const result = diaryReadItemSchema.safeParse(validReadItem)
      expect(result.success).toBe(true)
    })
  })

  describe('異常系', () => {
    it('readHistoryIdがbigintでない場合に検証失敗すること', () => {
      const result = diaryReadItemSchema.safeParse({
        ...validReadItem,
        readHistoryId: 1,
      })
      expect(result.success).toBe(false)
    })

    it('articleIdがbigintでない場合に検証失敗すること', () => {
      const result = diaryReadItemSchema.safeParse({
        ...validReadItem,
        articleId: '10',
      })
      expect(result.success).toBe(false)
    })

    it('mediaが許可リストにない場合に検証失敗すること', () => {
      const result = diaryReadItemSchema.safeParse({
        ...validReadItem,
        media: 'note',
      })
      expect(result.success).toBe(false)
    })

    it('urlが無効な形式の場合に検証失敗すること', () => {
      const result = diaryReadItemSchema.safeParse({
        ...validReadItem,
        url: 'not-a-url',
      })
      expect(result.success).toBe(false)
    })

    it('readAtがDate型でない場合に検証失敗すること', () => {
      const result = diaryReadItemSchema.safeParse({
        ...validReadItem,
        readAt: '2026-03-07',
      })
      expect(result.success).toBe(false)
    })
  })
})
