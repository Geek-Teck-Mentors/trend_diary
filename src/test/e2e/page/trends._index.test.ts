import { faker } from '@faker-js/faker'
import { expect, test } from '@playwright/test'
import accountTestHelper from '@/test/helper/accountTestHelper'
import articleTestHelper from '@/test/helper/articleTestHelper'

const ARTICLE_COUNT = 10

test.describe('記事一覧ページ', () => {
  test.describe.configure({ mode: 'default' })
  // テストアカウントの情報
  const testEmail = faker.internet.email()
  const testPassword = faker.internet.password()

  test.beforeAll(async () => {
    // 他のテストファイルのアカウントを削除しないよう、記事のみクリーンアップ
    await articleTestHelper.cleanUpArticles()

    // 1. まずはアカウントを作成
    await accountTestHelper.create(testEmail, testPassword)

    // 2. アカウントがCI環境でも確実に存在するように1000ms待機
    await new Promise((resolve) => setTimeout(resolve, 1000))
  })

  test.afterAll(async () => {
    await articleTestHelper.cleanUpArticles()
    await accountTestHelper.disconnect()
    await articleTestHelper.disconnect()
  })

  test.beforeEach(async ({ page }) => {
    // 2. ログイン
    await page.goto('/login')
    await page.getByLabel('メールアドレス').fill(testEmail)
    await page.getByLabel('パスワード').fill(testPassword)
    await page.getByRole('button', { name: 'ログイン' }).click()

    // 3. ページ遷移とページ内容の読み込みを待機
    await page.waitForURL('/trends', { timeout: 10000 })
    await page.waitForLoadState('networkidle', { timeout: 10000 })
  })

  test.afterEach(async ({ page }) => {
    // 1. セッションクリア
    await page.context().clearCookies()
  })

  test.describe('記事がない場合', () => {
    test.beforeAll(async () => {
      // 記事を削除
      await articleTestHelper.cleanUpArticles()
    })
    test('記事がないと表示される', async ({ page }) => {
      // 数秒待機して記事が読み込まれるのを待つ
      await page.waitForTimeout(2000)
      // 現在のページのURLを取得
      const currentUrl = page.url()
      console.log('Current URL:', currentUrl)
      // 記事の読み込みを待機
      await page.waitForLoadState('networkidle', { timeout: 10000 })

      // 記事がない場合は「記事がありません」が表示されることを確認
      await expect(page.getByText('記事がありません')).toBeVisible()
    })
  })

  test.describe('記事がある場合', () => {
    test.beforeAll(async () => {
      // 記事を作成
      await Promise.all(
        Array.from({ length: ARTICLE_COUNT }, (_, i) => articleTestHelper.createArticle()),
      )
    })
    test.beforeEach(async ({ page }) => {
      // 数秒待機して記事が読み込まれるのを待つ
      await page.waitForTimeout(2000)
      // 記事カードが表示されるまで待機
      await page.waitForSelector('[data-slot="card"]', { timeout: 10000 })
    })
    test('記事一覧から記事詳細を閲覧し、再び記事一覧に戻る', async ({ page }) => {
      // 現在のページのURLを取得
      const currentUrl = page.url()
      console.log('Current URL:', currentUrl)
      // 1. 記事カードの存在を確認
      const articleCards = page.locator('[data-slot="card"]')
      const articleCard = articleCards.first()
      await expect(articleCard).toBeVisible()

      await articleCard.click()

      // 2. ドロワーが開くのを待機
      await page.waitForSelector('[data-slot="drawer-content"]', { timeout: 10000 })

      // 3. ドロワーの存在を確認
      const drawer = page.locator('[data-slot="drawer-content"]')
      await expect(drawer).toBeVisible()

      // 4. ドロワーの閉じるボタンをクリック
      await drawer.locator('[data-slot="drawer-close"]').click()

      // 5. ドロワーが閉じるのを待機
      await page.waitForSelector('[data-slot="drawer-content"]', {
        state: 'detached',
        timeout: 10000,
      })

      // 6. 記事一覧に戻っていることを確認
      // 記事カードが表示されていることを確認
      await expect(articleCard).toBeVisible()
      // ドロワーが閉じていることを確認
      await expect(page.locator('[data-slot="drawer-content"]')).not.toBeVisible()
    })
    test('記事一覧から記事詳細を閲覧し、その実際の記事を閲覧する', async ({ page }) => {
      // 現在のページのURLを取得
      const currentUrl = page.url()
      console.log('Current URL:', currentUrl)
      const ARTICLE_URL = 'https://zenn.dev/kouphasi/articles/61a39a76d23dd1'

      // 1. 記事カードの存在を確認
      const articleCards = page.locator('[data-slot="card"]')
      const articleCard = articleCards.first()
      await expect(articleCard).toBeVisible()

      await articleCard.click()

      // 2. ドロワーが開くのを待機
      await page.waitForSelector('[data-slot="drawer-content"]', { timeout: 10000 })

      // 3. ドロワーの存在を確認
      const drawer = page.locator('[data-slot="drawer-content"]')
      await expect(drawer).toBeVisible()

      // 4. 記事を読むリンクをクリック
      const drawerLink = drawer.locator('[data-slot="drawer-content-link"]')
      // ドロワーの記事を読むリンクのURLを上書き
      await drawerLink.evaluate((element, url) => {
        ;(element as HTMLAnchorElement).href = url
      }, ARTICLE_URL)
      await drawerLink.click()

      // 5. 新しいタブでそのリンクのページに遷移する
      const [newPage] = await Promise.all([
        page.context().waitForEvent('page'),
        page.waitForLoadState('networkidle'),
      ])
      await expect(newPage).toHaveURL(ARTICLE_URL)
    })
  })
})
