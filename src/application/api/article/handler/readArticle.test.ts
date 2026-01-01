import { faker } from '@faker-js/faker'
import app from '@/application/server'
import TEST_ENV from '@/test/env'
import articleTestHelper from '@/test/helper/articleTestHelper'
import authV2TestHelper from '@/test/helper/authV2TestHelper'

describe('POST /api/articles/:article_id/read', () => {
  let testActiveUserId: bigint
  let testArticleId: bigint
  let accessToken: string

  async function setupTestData(): Promise<void> {
    // アカウント作成・ログイン
    await authV2TestHelper.create('test@example.com', 'Test@password123')
    const loginData = await authV2TestHelper.login('test@example.com', 'Test@password123')
    testActiveUserId = loginData.activeUserId
    accessToken = loginData.accessToken

    // テスト記事作成
    const article = await articleTestHelper.createArticle()
    testArticleId = article.articleId
  }

  async function requestReadArticle(articleId: string, token: string, readAt?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Cookie: `access_token=${token}`,
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
    await authV2TestHelper.cleanUp()
    await articleTestHelper.cleanUpArticles()
    await setupTestData()
  })

  afterAll(async () => {
    await authV2TestHelper.cleanUp()
    await articleTestHelper.cleanUpArticles()
  })

  describe('正常系', () => {
    it('既読履歴を作成できること', async () => {
      const fixedReadAt = '2024-01-01T10:00:00.000Z'
      const response = await requestReadArticle(testArticleId.toString(), accessToken, fixedReadAt)

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
      const response = await requestReadArticle('invalid-id', accessToken)

      expect(response.status).toBe(422)
    })
    it('無効なreadAtでバリデーションエラーが発生すること', async () => {
      const response = await requestReadArticle(
        testArticleId.toString(),
        accessToken,
        'invalid-date',
      )

      expect(response.status).toBe(422)
    })
    it('存在しない記事は既読履歴が作成できない', async () => {
      const nonExistentArticleId = '999999'

      const response = await requestReadArticle(nonExistentArticleId, accessToken)

      expect(response.status).toBe(404)
    })
  })
})
