import { describe, it, expect } from 'vitest';
import {
  readHistorySchema,
  createReadHistoryApiSchema,
  articleIdParamSchema,
} from './readHistorySchema';

describe('ReadHistoryスキーマ', () => {
  describe('readHistorySchema', () => {
    const validReadHistory = {
      readHistoryId: 1n,
      userId: 100n,
      articleId: 200n,
      readAt: new Date('2024-01-01T10:00:00Z'),
      createdAt: new Date('2024-01-01T10:00:00Z'),
      updatedAt: new Date('2024-01-01T10:00:00Z'),
    };

    it('有効なReadHistoryデータを受け入れること', () => {
      expect(() => {
        readHistorySchema.parse(validReadHistory);
      }).not.toThrow();
    });

    it('bigint型でないIDを拒否すること', () => {
      expect(() => {
        readHistorySchema.parse({
          ...validReadHistory,
          readHistoryId: '1',
        });
      }).toThrow();

      expect(() => {
        readHistorySchema.parse({
          ...validReadHistory,
          userId: 100,
        });
      }).toThrow();

      expect(() => {
        readHistorySchema.parse({
          ...validReadHistory,
          articleId: '200',
        });
      }).toThrow();
    });

    it('Date型でない日時を拒否すること', () => {
      expect(() => {
        readHistorySchema.parse({
          ...validReadHistory,
          readAt: '2024-01-01T10:00:00Z',
        });
      }).toThrow();

      expect(() => {
        readHistorySchema.parse({
          ...validReadHistory,
          createdAt: 1704096000000,
        });
      }).toThrow();
    });
  });

  describe('createReadHistoryApiSchema', () => {
    it('有効なISO8601文字列を受け入れること', () => {
      const validRequest = {
        readAt: '2024-01-01T10:00:00.000Z',
      };

      expect(() => {
        createReadHistoryApiSchema.parse(validRequest);
      }).not.toThrow();
    });

    it('無効な日時文字列を拒否すること', () => {
      expect(() => {
        createReadHistoryApiSchema.parse({
          readAt: 'invalid-date',
        });
      }).toThrow();

      expect(() => {
        createReadHistoryApiSchema.parse({
          readAt: '2024-01-01',
        });
      }).toThrow();
    });

    it('readAtフィールドが必須であること', () => {
      expect(() => {
        createReadHistoryApiSchema.parse({});
      }).toThrow();
    });
  });

  describe('articleIdParamSchema', () => {
    it('有効な数値文字列をbigintに変換すること', () => {
      const result = articleIdParamSchema.parse({
        article_id: '123456789',
      });

      expect(result.article_id).toBe(123456789n);
    });

    it('無効な文字列を拒否すること', () => {
      expect(() => {
        articleIdParamSchema.parse({
          article_id: 'not-a-number',
        });
      }).toThrow();

      expect(() => {
        articleIdParamSchema.parse({
          article_id: '',
        });
      }).toThrow();
    });

    it('article_idフィールドが必須であること', () => {
      expect(() => {
        articleIdParamSchema.parse({});
      }).toThrow();
    });
  });
});
