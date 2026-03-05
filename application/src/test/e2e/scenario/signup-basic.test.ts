import { expect, type Locator, type Page, test } from '@playwright/test'
import * as articleHelper from '@/test/helper/article'
import * as userHelper from '@/test/helper/user'

const TIMEOUT = 10000
const AUTH_FLOW_TIMEOUT = 20000

async function submitAuthForm(
  page: Page,
  submitButtonName: 'アカウント作成' | 'ログイン',
  endpoint: 'signup' | 'login',
): Promise<void> {
  const responsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' && response.url().includes(`/api/v2/auth/${endpoint}`),
    { timeout: 5000 },
  )

  await page.getByRole('button', { name: submitButtonName }).click()
  const response = await responsePromise
  expect(response.ok()).toBeTruthy()
}

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
      await expect(loginPageText).toBeVisible({ timeout: 2000 })
      return
    }

    await page.getByLabel('メールアドレス').fill(email)
    await page.getByLabel('パスワード').fill(password)
    await submitAuthForm(page, 'アカウント作成', 'signup')

    await expect(page).toHaveURL(/\/login(?:\?.*)?$/, { timeout: 5000 })
    await expect(loginPageText).toBeVisible({ timeout: 5000 })
  }).toPass({ timeout: AUTH_FLOW_TIMEOUT })
}

async function completeLoginAndMoveToTrends(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  const trendsPageText = page.getByText('絞り込み')
  const readStatusFilter = page.locator('[data-slot="read-status-filter"]')

  await expect(async () => {
    if (new URL(page.url()).pathname === '/trends') {
      await expect(trendsPageText).toBeVisible({ timeout: 2000 })
      await expect(readStatusFilter).toBeVisible({ timeout: 2000 })
      return
    }

    await page.getByLabel('メールアドレス').fill(email)
    await page.getByLabel('パスワード').fill(password)
    await submitAuthForm(page, 'ログイン', 'login')

    await expect(page).toHaveURL(/\/trends(?:\?.*)?$/, { timeout: 5000 })
    await expect(trendsPageText).toBeVisible({ timeout: 5000 })
    await expect(readStatusFilter).toBeVisible({ timeout: 5000 })
  }).toPass({ timeout: AUTH_FLOW_TIMEOUT })
}

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
    await page.goto('/signup')
    await completeSignupAndMoveToLogin(page, email, password)
    await completeLoginAndMoveToTrends(page, email, password)

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
