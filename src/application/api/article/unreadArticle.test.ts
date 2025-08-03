import app from '@/application/server'
import TEST_ENV from '@/test/env'
import activeUserTestHelper from '@/test/helper/activeUserTestHelper'
import articleTestHelper from '@/test/helper/articleTestHelper'

describe('DELETE /api/articles/:article_id/unread', () => {
  let testActiveUserId: bigint
  let testArticleId: bigint
  let sessionId: string

  async function setupTestData(): Promise<void> {
    // アカウント作成・ログイン
    await activeUserTestHelper.create('test@example.com', 'password123')
    const loginData = await activeUserTestHelper.login('test@example.com', 'password123')
    testActiveUserId = loginData.activeUserId
    sessionId = loginData.sessionId

    // テスト記事作成
    const article = await articleTestHelper.createArticle()
    testArticleId = article.articleId

    // 既読履歴を事前に作成（削除テスト用）
    await articleTestHelper.createReadHistory(
      testActiveUserId,
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
    await activeUserTestHelper.cleanUp()
    await articleTestHelper.cleanUpArticles()
    await setupTestData()
  })

  afterAll(async () => {
    await activeUserTestHelper.cleanUp()
    await articleTestHelper.cleanUpArticles()
  })

  describe('正常系', () => {
    it('既読履歴を削除できること', async () => {
      // 事前に既読履歴があることを確認
      const beforeCount = await articleTestHelper.countReadHistories(
        testActiveUserId,
        testArticleId,
      )
      expect(beforeCount).toBe(1)

      const response = await requestUnreadArticle(testArticleId.toString(), sessionId)

      expect(response.status).toBe(200)
      const json = (await response.json()) as { message: string }
      expect(json.message).toBe('記事を未読にしました')

      // DBから実際に削除されていることを確認
      const afterCount = await articleTestHelper.countReadHistories(testActiveUserId, testArticleId)
      expect(afterCount).toBe(0)
    })

    it('既読履歴がなくてもOK', async () => {
      // 既読履歴を削除
      await articleTestHelper.deleteReadHistory(testActiveUserId, testArticleId)

      const response = await requestUnreadArticle(testArticleId.toString(), sessionId)

      expect(response.status).toBe(200)
      const json = (await response.json()) as { message: string }
      expect(json.message).toBe('記事を未読にしました')

      // DBから実際に削除されていることを確認
      const afterCount = await articleTestHelper.countReadHistories(testActiveUserId, testArticleId)
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
