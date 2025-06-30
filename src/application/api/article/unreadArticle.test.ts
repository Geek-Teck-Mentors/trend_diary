import app from '@/application/server'
import TEST_ENV from '@/test/env'
import accountTestHelper from '@/test/helper/accountTestHelper'
import articleTestHelper from '@/test/helper/articleTestHelper'

describe('DELETE /api/articles/:article_id/unread', () => {
  let testUserId: bigint
  let testArticleId: bigint
  let sessionId: string

  async function setupTestData(): Promise<void> {
    // アカウント作成・ログイン
    await accountTestHelper.create('test@example.com', 'password123')
    const loginData = await accountTestHelper.login('test@example.com', 'password123')
    testUserId = loginData.userId
    sessionId = loginData.sessionId

    // テスト記事作成
    const article = await articleTestHelper.createArticle()
    testArticleId = article.articleId

    // 既読履歴を事前に作成（削除テスト用）
    await articleTestHelper.createReadHistory(
      testUserId,
      testArticleId,
      new Date('2024-01-01T10:00:00Z'),
    )
  }

  async function requestUnreadArticle(articleId: string, sessionId: string) {
    const headers: Record<string, string> = {
      Cookie: `sid=${sessionId}`,
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

  beforeEach(async () => {
    await accountTestHelper.cleanUp()
    await articleTestHelper.cleanUpArticles()
    await setupTestData()
  })

  afterAll(async () => {
    await accountTestHelper.cleanUp()
    await articleTestHelper.cleanUpArticles()
  })

  describe('正常系', () => {
    it('既読履歴を削除できること', async () => {
      // 事前に既読履歴があることを確認
      const beforeCount = await articleTestHelper.countReadHistories(testUserId, testArticleId)
      expect(beforeCount).toBe(1)

      const response = await requestUnreadArticle(testArticleId.toString(), sessionId)

      expect(response.status).toBe(200)
      const json = (await response.json()) as { message: string }
      expect(json.message).toBe('記事を未読にしました')

      // DBから実際に削除されていることを確認
      const afterCount = await articleTestHelper.countReadHistories(testUserId, testArticleId)
      expect(afterCount).toBe(0)
    })

    it('既読履歴がなくてもOK', async () => {
      // 既読履歴を削除
      await articleTestHelper.deleteReadHistory(testUserId, testArticleId)

      const response = await requestUnreadArticle(testArticleId.toString(), sessionId)

      expect(response.status).toBe(200)
      const json = (await response.json()) as { message: string }
      expect(json.message).toBe('記事を未読にしました')

      // DBから実際に削除されていることを確認
      const afterCount = await articleTestHelper.countReadHistories(testUserId, testArticleId)
      expect(afterCount).toBe(0)
    })
  })

  describe('準正常系', () => {
    it('無効なarticle_idでバリデーションエラーが発生すること', async () => {
      const response = await requestUnreadArticle('invalid-id', sessionId)

      expect(response.status).toBe(422)
    })

    it('記事が存在しない場合はエラー', async () => {
      // 既読履歴を事前に削除
      await articleTestHelper.deleteArticle(testArticleId)

      const response = await requestUnreadArticle(testArticleId.toString(), sessionId)
      expect(response.status).toBe(404)
    })
  })
})
