import { faker } from '@faker-js/faker'
import { expect, test } from '@playwright/test'
import { waitAuthApiResponse } from '@/test/e2e/helper/auth-api'
import { AuthPage } from '@/test/e2e/pom/auth-page'
import { ArticleDrawer } from '@/test/e2e/pom/components/article-drawer'
import { TrendsPage } from '@/test/e2e/pom/trends-page'
import * as articleHelper from '@/test/helper/article'
import * as userHelper from '@/test/helper/user'

test.describe('新規登録・ログイン後の記事詳細閲覧シナリオ', () => {
  const password = 'Aa1@aaaa'
  const suffix = faker.string.alphanumeric(10).toLowerCase()
  const email = faker.internet.email({
    firstName: 'e2e',
    lastName: `scenario${suffix}`,
    provider: 'example.com',
    allowSpecialCharacters: false,
  })
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

    await userHelper.cleanUpByEmailPattern(email)
  })

  test('ログイン後にトレンド記事の詳細を開ける', async ({ page }) => {
    {
      const authPage = new AuthPage(page)
      await authPage.gotoSignup()

      let signupStatus = 0
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const signupResponsePromise = waitAuthApiResponse(page, 'signup')
        await authPage.submitSignup(email, password)
        signupStatus = (await signupResponsePromise).status()

        if (signupStatus === 201 || signupStatus === 409) {
          break
        }

        if (signupStatus >= 500 || signupStatus === 429) {
          await authPage.gotoSignup()
          continue
        }

        throw new Error(`unexpected signup status: ${signupStatus}`)
      }
      expect([201, 409]).toContain(signupStatus)

      await authPage.moveToLoginIfOnSignup()
      await authPage.waitForLoginPage()

      let loginStatus = 0
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const loginResponsePromise = waitAuthApiResponse(page, 'login')
        await authPage.submitLogin(email, password)
        loginStatus = (await loginResponsePromise).status()

        if (loginStatus === 200) {
          break
        }

        if (loginStatus >= 500 || loginStatus === 429) {
          await authPage.gotoLogin()
          await authPage.waitForLoginPage()
          continue
        }

        throw new Error(`unexpected login status: ${loginStatus}`)
      }
      expect(loginStatus).toBe(200)
      await authPage.waitForTrendsPage()
    }

    {
      const trendsPage = new TrendsPage(page)
      await trendsPage.openArticleByTitle(articleTitle)
    }

    {
      const drawer = new ArticleDrawer(page)
      await drawer.waitOpen()
      await drawer.expectContains(articleTitle)
      await drawer.expectReadArticleButtonVisible()
    }
  })
})
