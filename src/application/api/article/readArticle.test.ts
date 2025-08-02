import { faker } from '@faker-js/faker'
import app from '@/application/server'
import TEST_ENV from '@/test/env'
import accountTestHelper from '@/test/helper/accountTestHelper'
import articleTestHelper from '@/test/helper/articleTestHelper'

describe('POST /api/articles/:article_id/read', () => {
  let testActiveUserId: bigint
  let testArticleId: bigint
  let sessionId: string

  async function setupTestData(): Promise<void> {
    // アカウント作成・ログイン
    await accountTestHelper.create('test@example.com', 'password123')
    const loginData = await accountTestHelper.login('test@example.com', 'password123')
    testActiveUserId = loginData.activeUserId
    sessionId = loginData.sessionId

    // テスト記事作成
    const article = await articleTestHelper.createArticle()
    testArticleId = article.articleId
  }

  async function requestReadArticle(articleId: string, sessionId: string, readAt?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Cookie: `sid=${sessionId}`,
    }

    return app.request(
      `/api/articles/${articleId}/read`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          read_at: readAt || faker.date.recent().toISOString(),
        }),
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
    it('既読履歴を作成できること', async () => {
      const fixedReadAt = '2024-01-01T10:00:00.000Z'
      const response = await requestReadArticle(testArticleId.toString(), sessionId, fixedReadAt)

      expect(response.status).toBe(201)
      const json = (await response.json()) as { message: string }
      expect(json.message).toBe('記事を既読にしました')

      // DBに実際に記録されていることを確認
      const readHistory = await articleTestHelper.findReadHistory(testActiveUserId, testArticleId)
      expect(readHistory).toBeTruthy()
      expect(readHistory!.readAt).toEqual(new Date(fixedReadAt))
    })
  })

  describe('準正常系', () => {
    it('無効なarticle_idでバリデーションエラーが発生すること', async () => {
      const response = await requestReadArticle('invalid-id', sessionId)

      expect(response.status).toBe(422)
    })
    it('無効なreadAtでバリデーションエラーが発生すること', async () => {
      const response = await requestReadArticle(testArticleId.toString(), sessionId, 'invalid-date')

      expect(response.status).toBe(422)
    })
    it('存在しない記事は既読履歴が作成できない', async () => {
      const nonExistentArticleId = '999999'

      const response = await requestReadArticle(nonExistentArticleId, sessionId)

      expect(response.status).toBe(404)
    })
  })
})
