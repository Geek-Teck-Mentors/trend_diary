import { describe, expect, it } from 'vitest'
import { articleIdParamSchema, createReadHistoryApiSchema } from './readHistorySchema'

describe('ReadHistoryスキーマ', () => {
  describe('createReadHistoryApiSchema', () => {
    it('有効なISO8601文字列を受け入れること', () => {
      const validRequest = {
        read_at: '2024-01-01T10:00:00.000Z',
      }

      expect(() => {
        createReadHistoryApiSchema.parse(validRequest)
      }).not.toThrow()
    })

    it('無効な日時文字列を拒否すること', () => {
      expect(() => {
        createReadHistoryApiSchema.parse({
          read_at: 'invalid-date',
        })
      }).toThrow()

      expect(() => {
        createReadHistoryApiSchema.parse({
          read_at: '2024-01-01',
        })
      }).toThrow()
    })

    it('readAtフィールドが必須であること', () => {
      expect(() => {
        createReadHistoryApiSchema.parse({})
      }).toThrow()
    })
  })

  describe('articleIdParamSchema', () => {
    it('有効な数値文字列をbigintに変換すること', () => {
      const result = articleIdParamSchema.parse({
        article_id: '123456789',
      })

      expect(result.article_id).toBe(123456789n)
    })

    it('無効な文字列を拒否すること', () => {
      expect(() => {
        articleIdParamSchema.parse({
          article_id: 'not-a-number',
        })
      }).toThrow()

      expect(() => {
        articleIdParamSchema.parse({
          article_id: '',
        })
      }).toThrow()
    })

    it('article_idフィールドが必須であること', () => {
      expect(() => {
        articleIdParamSchema.parse({})
      }).toThrow()
    })
  })
})
