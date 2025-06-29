import { isSuccess } from '@/common/types/utility'
import { AccountRepositoryImpl, AccountService, UserRepositoryImpl } from '@/domain/account'
import getRdbClient, { RdbClient } from '@/infrastructure/rdb'
import TEST_ENV from '@/test/env'
import accountTestHelper from '@/test/helper/accountTestHelper'
import app from '../../server'

describe('DELETE /api/articles/:article_id/unread', () => {
  let db: RdbClient
  let testUserId: bigint
  let testArticleId: bigint
  let sessionId: string

  async function setupTestData(): Promise<void> {
    // アカウント作成
    await accountTestHelper.createTestAccount('test@example.com', 'password123')

    const accountService = new AccountService(
      new AccountRepositoryImpl(db),
      new UserRepositoryImpl(db),
    )

    const loginResult = await accountService.login('test@example.com', 'password123')
    if (!isSuccess(loginResult)) throw new Error('Failed to login')

    testUserId = loginResult.data.user.userId
    sessionId = loginResult.data.sessionId

    // テスト記事作成
    const article = await db.article.create({
      data: {
        media: 'qiita',
        title: 'テスト記事',
        author: 'テスト太郎',
        description: 'テスト用の記事',
        url: 'https://example.com/test',
      },
    })
    testArticleId = article.articleId

    // 既読履歴を事前に作成（削除テスト用）
    await db.readHistory.create({
      data: {
        userId: testUserId,
        articleId: testArticleId,
        readAt: new Date('2024-01-01T10:00:00Z'),
      },
    })
  }

  async function requestDeleteReadHistory(articleId: string, cookie?: string) {
    const headers: Record<string, string> = {}
    if (cookie) {
      headers.Cookie = cookie
    }

    return app.request(
      `/api/articles/${articleId}/unread`,
      {
        method: 'DELETE',
        headers,
      },
      TEST_ENV,
    )
  }

  beforeAll(() => {
    db = getRdbClient(TEST_ENV.DATABASE_URL)
  })

  beforeEach(async () => {
    await accountTestHelper.cleanUp()
    // 記事テーブルもクリーンアップ
    await db.$queryRaw`TRUNCATE TABLE "articles";`
    await setupTestData()
  })

  afterAll(async () => {
    await accountTestHelper.cleanUp()
    await db.$queryRaw`TRUNCATE TABLE "articles";`
  })

  describe('正常系', () => {
    it('既読履歴を削除できること', async () => {
      // 事前に既読履歴があることを確認
      const beforeCount = await db.readHistory.count({
        where: {
          userId: testUserId,
          articleId: testArticleId,
        },
      })
      expect(beforeCount).toBe(1)

      const response = await requestDeleteReadHistory(testArticleId.toString(), `sid=${sessionId}`)

      expect(response.status).toBe(200)
      const json = (await response.json()) as { message: string }
      expect(json.message).toBe('記事を未読にしました')

      // DBから実際に削除されていることを確認
      const afterCount = await db.readHistory.count({
        where: {
          userId: testUserId,
          articleId: testArticleId,
        },
      })
      expect(afterCount).toBe(0)
    })

    it("既読履歴がなくてもOK", async () => {
      // 既読履歴を削除
      await db.readHistory.deleteMany({
        where: {
          userId: testUserId,
          articleId: testArticleId,
        },
      })

      const response = await requestDeleteReadHistory(testArticleId.toString(), `sid=${sessionId}`)

      expect(response.status).toBe(200)
      const json = (await response.json()) as { message: string }
      expect(json.message).toBe('記事を未読にしました')

      // DBから実際に削除されていることを確認
      const afterCount = await db.readHistory.count({
        where: {
          userId: testUserId,
          articleId: testArticleId,
        },
      })
      expect(afterCount).toBe(0)
    })
  })

  describe('準正常系', () => {
    it('無効なarticle_idでバリデーションエラーが発生すること', async () => {
      const response = await requestDeleteReadHistory('invalid-id', `sid=${sessionId}`)

      expect(response.status).toBe(422)
    })

    it('記事が存在しない場合はエラー', async () => {
      // 既読履歴を事前に削除
      await db.article.deleteMany({
        where: {
          articleId: testArticleId,
        },
      })

      const response = await requestDeleteReadHistory(testArticleId.toString(), `sid=${sessionId}`)
      expect(response.status).toBe(404)
    })
  })
})
