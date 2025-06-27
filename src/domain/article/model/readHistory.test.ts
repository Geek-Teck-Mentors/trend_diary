import { describe, it, expect } from 'vitest';
import ReadHistory from './readHistory';

describe('ReadHistory', () => {
  it('should create ReadHistory instance', () => {
    const readHistoryId = 1n;
    const userId = 100n;
    const articleId = 200n;
    const readAt = new Date('2024-01-01T10:00:00Z');
    const createdAt = new Date('2024-01-01T10:00:00Z');
    const updatedAt = new Date('2024-01-01T10:00:00Z');

    const readHistory = new ReadHistory(
      readHistoryId,
      userId,
      articleId,
      readAt,
      createdAt,
      updatedAt,
    );

    expect(readHistory.readHistoryId).toBe(readHistoryId);
    expect(readHistory.userId).toBe(userId);
    expect(readHistory.articleId).toBe(articleId);
    expect(readHistory.readAt).toBe(readAt);
    expect(readHistory.createdAt).toBe(createdAt);
    expect(readHistory.updatedAt).toBe(updatedAt);
  });

  it('should create ReadHistory with default timestamps', () => {
    const readHistoryId = 1n;
    const userId = 100n;
    const articleId = 200n;
    const readAt = new Date('2024-01-01T10:00:00Z');

    const readHistory = new ReadHistory(readHistoryId, userId, articleId, readAt);

    expect(readHistory.readHistoryId).toBe(readHistoryId);
    expect(readHistory.userId).toBe(userId);
    expect(readHistory.articleId).toBe(articleId);
    expect(readHistory.readAt).toBe(readAt);
    expect(readHistory.createdAt).toBeInstanceOf(Date);
    expect(readHistory.updatedAt).toBeInstanceOf(Date);
  });
});
