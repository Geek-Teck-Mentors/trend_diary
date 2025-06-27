import getRdbClient, { RdbClient } from '@/infrastructure/rdb';
import app from '../../server';
import TEST_ENV from '@/test/env';
import accountTestHelper from '@/test/helper/accountTestHelper';
import { AccountService, UserRepositoryImpl, AccountRepositoryImpl } from '@/domain/account';
import { isSuccess } from '@/common/types/utility';

describe('POST /api/articles/:article_id/read', () => {
  let db: RdbClient;
  let testUserId: bigint;
  let testArticleId: bigint;
  let sessionId: string;

  async function setupTestData(): Promise<void> {
    // アカウント作成
    await accountTestHelper.createTestAccount('test@example.com', 'password123');

    const accountService = new AccountService(
      new AccountRepositoryImpl(db),
      new UserRepositoryImpl(db),
    );

    const loginResult = await accountService.login('test@example.com', 'password123');
    if (!isSuccess(loginResult)) throw new Error('Failed to login');

    testUserId = loginResult.data.user.userId;
    sessionId = loginResult.data.sessionId;

    // テスト記事作成
    const article = await db.article.create({
      data: {
        media: 'qiita',
        title: 'テスト記事',
        author: 'テスト太郎',
        description: 'テスト用の記事',
        url: 'https://example.com/test',
      },
    });
    testArticleId = article.articleId;
  }

  async function requestCreateReadHistory(articleId: string, body: any, cookie?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (cookie) {
      headers.Cookie = cookie;
    }

    return app.request(
      `/api/articles/${articleId}/read`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      },
      TEST_ENV,
    );
  }

  beforeAll(() => {
    db = getRdbClient(TEST_ENV.DATABASE_URL);
  });

  beforeEach(async () => {
    await accountTestHelper.cleanUp();
    // 記事テーブルもクリーンアップ
    await db.$queryRaw`TRUNCATE TABLE "articles";`;
    await setupTestData();
  });

  afterAll(async () => {
    await accountTestHelper.cleanUp();
    await db.$queryRaw`TRUNCATE TABLE "articles";`;
  });

  it('正常にReadHistoryを作成できること', async () => {
    const readAt = '2024-01-01T10:00:00.000Z';

    const response = await requestCreateReadHistory(
      testArticleId.toString(),
      { readAt },
      `sid=${sessionId}`,
    );

    expect(response.status).toBe(201);
    const json = (await response.json()) as { message: string };
    expect(json.message).toBe('記事を既読にしました');

    // DBに実際に記録されていることを確認
    const readHistory = await db.readHistory.findFirst({
      where: {
        userId: testUserId,
        articleId: testArticleId,
      },
    });
    expect(readHistory).toBeTruthy();
    expect(readHistory!.readAt).toEqual(new Date(readAt));
  });

  it('無効なarticle_idでバリデーションエラーが発生すること', async () => {
    const response = await requestCreateReadHistory(
      'invalid-id',
      { readAt: '2024-01-01T10:00:00.000Z' },
      `sid=${sessionId}`,
    );

    expect(response.status).toBe(400);
  });

  it('無効なreadAtでバリデーションエラーが発生すること', async () => {
    const response = await requestCreateReadHistory(
      testArticleId.toString(),
      { readAt: 'invalid-date' },
      `sid=${sessionId}`,
    );

    expect(response.status).toBe(422);
  });

  it('認証されていない場合にエラーが発生すること', async () => {
    const response = await requestCreateReadHistory(testArticleId.toString(), {
      readAt: '2024-01-01T10:00:00.000Z',
    });

    expect(response.status).toBe(401);
  });

  it('存在しない記事でも既読履歴が作成されること', async () => {
    const nonExistentArticleId = '999999';
    const readAt = '2024-01-01T10:00:00.000Z';

    const response = await requestCreateReadHistory(
      nonExistentArticleId,
      { readAt },
      `sid=${sessionId}`,
    );

    expect(response.status).toBe(201);

    // DBに記録されていることを確認
    const readHistory = await db.readHistory.findFirst({
      where: {
        userId: testUserId,
        articleId: BigInt(nonExistentArticleId),
      },
    });
    expect(readHistory).toBeTruthy();
  });
});
