import { expect, test } from '@playwright/test'
import articleTestHelper from '@/test/helper/articleTestHelper'

const ARTICLE_COUNT = 10

test.describe('記事一覧ページ', () => {
  test.describe.configure({ mode: 'default' })

  test.beforeAll(async () => {
    await articleTestHelper.cleanUpArticles()
  })

  test.afterAll(async () => {
    await articleTestHelper.cleanUpArticles()
    await articleTestHelper.disconnect()
  })

  test.beforeEach(async ({ page }) => {
    await page.goto('/trends')
  })

  test.describe('記事がない場合', () => {
    test('記事がないと表示される', async ({ page }) => {
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
      // カードが表示されるのを待機
      await page.locator('[data-slot="card"]').nth(0).waitFor({ state: 'attached', timeout: 30000 })
    })
    test('記事一覧から記事詳細を閲覧し、再び記事一覧に戻る', async ({ page }) => {
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
      const ARTICLE_URL = 'https://zenn.dev/kouphasi/articles/61a39a76d23dd1'

      // 1. 記事カードをクリック
      const articleCard = page.locator('[data-slot="card"]').first()
      await articleCard.click()

      // 2. ドロワーが開くのを待機
      await page.waitForSelector('[data-slot="drawer-content"]', { timeout: 10000 })

      // 3. ドロワーの存在を確認
      const drawer = page.locator('[data-slot="drawer-content"]')
      await expect(drawer).toBeVisible()

      // 4. 記事を読むリンクをクリック
      const drawerLink = drawer.locator('[data-slot="drawer-content-link"]')
      await expect(drawerLink).toBeVisible()
      // ドロワーの記事を読むリンクのURLを上書き
      await drawerLink.evaluate((element, url) => {
        ;(element as HTMLAnchorElement).href = url
      }, ARTICLE_URL)
      await drawerLink.click()

      // 5. 新しいタブでそのリンクのページに遷移する
      const newPage = await page.context().waitForEvent('page')
      await expect(newPage).toHaveURL(ARTICLE_URL)
    })
  })
})
