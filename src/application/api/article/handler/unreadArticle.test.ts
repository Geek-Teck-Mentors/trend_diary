import { vi } from 'vitest'
import app from '@/application/server'
import TEST_ENV from '@/test/env'
import articleTestHelper from '@/test/helper/articleTestHelper'
import authV2TestHelper, {
  mockCommand,
  mockQuery,
  mockRepository,
} from '@/test/helper/authV2TestHelper'

// SupabaseAuthRepositoryをモックして、MockAuthV2Repositoryを使う
vi.mock('@/domain/auth-v2/infrastructure/supabaseAuthRepository', () => ({
  SupabaseAuthRepository: vi.fn(() => mockRepository),
}))

// QueryImplをモック
vi.mock('@/domain/user/infrastructure/queryImpl', () => ({
  default: vi.fn(() => mockQuery),
}))

// CommandImplをモック
vi.mock('@/domain/user/infrastructure/commandImpl', () => ({
  default: vi.fn(() => mockCommand),
}))

// createSupabaseAuthClientはモックして何も返さない（使われないため）
vi.mock('@/infrastructure/supabase', () => ({
  createSupabaseAuthClient: () => ({}),
}))

describe('DELETE /api/articles/:article_id/unread', () => {
  let testActiveUserId: bigint
  let testArticleId: bigint
  let AccessToken: string

  async function setupTestData(): Promise<void> {
    // アカウント作成・ログイン
    await authV2TestHelper.create('test@example.com', 'Test@password123')
    const loginData = await authV2TestHelper.login('test@example.com', 'Test@password123')
    testActiveUserId = loginData.activeUserId
    AccessToken = loginData.accessToken

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

  async function requestUnreadArticle(articleId: string, token: string) {
    const headers: Record<string, string> = {
      Cookie: `access_token=${token}`,
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
    await authV2TestHelper.cleanUp()
    await articleTestHelper.cleanUpArticles()
    await setupTestData()
  })

  afterAll(async () => {
    await authV2TestHelper.cleanUp()
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

      const response = await requestUnreadArticle(testArticleId.toString(), AccessToken)

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

      const response = await requestUnreadArticle(testArticleId.toString(), AccessToken)

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
      const response = await requestUnreadArticle('invalid-id', AccessToken)

      expect(response.status).toBe(422)
    })

    it('記事が存在しない場合はエラー', async () => {
      // 既読履歴を事前に削除
      await articleTestHelper.deleteArticle(testArticleId)

      const response = await requestUnreadArticle(testArticleId.toString(), AccessToken)
      expect(response.status).toBe(404)
    })
  })
})
