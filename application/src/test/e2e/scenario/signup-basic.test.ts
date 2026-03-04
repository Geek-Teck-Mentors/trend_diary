import { expect, type Locator, type Page, test } from '@playwright/test'
import * as articleHelper from '@/test/helper/article'
import * as userHelper from '@/test/helper/user'

const TIMEOUT = 10000

async function waitDrawerOpen(page: Page): Promise<Locator> {
  await page.getByRole('dialog').waitFor({ state: 'visible', timeout: TIMEOUT })

  const drawer = page.getByRole('dialog')
  await expect(drawer).toBeVisible({ timeout: TIMEOUT })

  return drawer
}

async function completeSignupAndMoveToLogin(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  const loginPageText = page.getByText('アカウントをお持ちでないですか？')

  await expect(async () => {
    if (new URL(page.url()).pathname === '/login') {
      await expect(loginPageText).toBeVisible({ timeout: 1000 })
      return
    }

    await page.getByLabel('メールアドレス').fill(email)
    await page.getByLabel('パスワード').fill(password)
    await page.getByRole('button', { name: 'アカウント作成' }).click()

    await expect(page).toHaveURL(/\/login(?:\?.*)?$/, { timeout: 2000 })
    await expect(loginPageText).toBeVisible({ timeout: 2000 })
  }).toPass({ timeout: TIMEOUT })
}

test.describe('ログイン後の記事詳細閲覧シナリオ', () => {
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
    await page.goto('/signup')
    await completeSignupAndMoveToLogin(page, email, password)

    await page.getByLabel('メールアドレス').fill(email)
    await page.getByLabel('パスワード').fill(password)
    await page.getByRole('button', { name: 'ログイン' }).click()

    await page.waitForURL('**/trends', { timeout: TIMEOUT })

    await expect(page.locator('[data-slot="read-status-filter"]')).toBeVisible({
      timeout: TIMEOUT,
    })

    const targetArticleCard = page.locator('[data-slot="card"]', { hasText: articleTitle }).first()
    await expect(targetArticleCard).toBeVisible({ timeout: TIMEOUT })
    await targetArticleCard.click()

    const drawer = await waitDrawerOpen(page)
    await expect(drawer).toContainText(articleTitle)
    await expect(drawer.getByRole('button', { name: '記事を読む' })).toBeVisible({
      timeout: TIMEOUT,
    })
  })
})
