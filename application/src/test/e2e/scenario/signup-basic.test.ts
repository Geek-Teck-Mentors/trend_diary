import { test } from '@playwright/test'
import { AuthPage } from '@/test/e2e/pom/auth-page'
import { ArticleDrawer } from '@/test/e2e/pom/components/article-drawer'
import { TrendsPage } from '@/test/e2e/pom/trends-page'
import * as articleHelper from '@/test/helper/article'
import * as userHelper from '@/test/helper/user'

test.describe('新規登録・ログイン後の記事詳細閲覧シナリオ', () => {
  const password = 'Aa1@aaaa'
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const email = `e2e-scenario-${suffix}@example.com`
  const articleTitle = `E2Eシナリオ記事-${suffix}`

  let createdArticleId: bigint | null = null

  test.beforeAll(async () => {
    const article = await articleHelper.createArticle({
      title: articleTitle,
      media: 'zenn',
    })
    createdArticleId = article.articleId
  })

  test.afterAll(async () => {
    if (createdArticleId) {
      await articleHelper.cleanUp([createdArticleId])
    }

    await userHelper.cleanUpByEmailPattern(suffix)
  })

  test('ログイン後にトレンド記事の詳細を開ける', async ({ page }) => {
    const authPage = new AuthPage(page)
    await authPage.gotoSignup()
    await authPage.signupAndMoveToLogin(email, password)
    await authPage.loginAndMoveToTrends(email, password)

    const trendsPage = new TrendsPage(page)
    await trendsPage.openArticleByTitle(articleTitle)

    const drawer = new ArticleDrawer(page)
    await drawer.waitOpen()
    await drawer.expectContains(articleTitle)
    await drawer.expectReadArticleButtonVisible()
  })
})
