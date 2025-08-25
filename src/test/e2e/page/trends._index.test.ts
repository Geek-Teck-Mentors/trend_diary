import { expect, Locator, Page, test } from '@playwright/test'
import articleTestHelper from '@/test/helper/articleTestHelper'

const ARTICLE_COUNT = 10
const TIMEOUT = 10000

test.describe('記事一覧ページ', () => {
  test.describe.configure({ mode: 'serial' })

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
      await expect(page.getByText('記事がありません')).toBeVisible({ timeout: TIMEOUT })
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
      await page.locator("[data-slot='card']").nth(0).waitFor({ timeout: TIMEOUT })
    })

    async function waitDrawerOpen(page: Page): Promise<Locator> {
      // ドロワーが開くのを待機
      await page.getByRole('dialog').waitFor({ state: 'visible', timeout: TIMEOUT })

      // ドロワーの存在を確認
      const drawer = page.getByRole('dialog')
      await expect(drawer).toBeVisible()

      return drawer
    }

    test('記事一覧から記事詳細を閲覧し、再び記事一覧に戻る', async ({ page }) => {
      // 1. 記事カードの存在を確認
      const articleCards = page.locator('[data-slot="card"]')
      const articleCard = articleCards.first()
      await expect(articleCard).toBeVisible()

      await articleCard.click()

      const drawer = await waitDrawerOpen(page)
      await drawer.getByRole('button', { name: 'Close' }).click()

      // 5. ドロワーが閉じるのを待機
      await page.getByRole('dialog').waitFor({
        state: 'detached',
        timeout: TIMEOUT,
      })

      // 6. 記事一覧に戻っていることを確認
      // 記事カードが表示されていることを確認
      await expect(articleCard).toBeVisible()
      // ドロワーが閉じていることを確認
      await expect(page.getByRole('dialog')).not.toBeVisible()
    })

    test('記事一覧から記事詳細を閲覧し、その実際の記事を閲覧する', async ({ page }) => {
      const ARTICLE_URL = 'https://zenn.dev/kouphasi/articles/61a39a76d23dd1'

      // 1. 記事カードをクリック
      const articleCard = page.locator('[data-slot="card"]').first()
      await articleCard.click()

      const drawer = await waitDrawerOpen(page)
      const drawerLink = drawer.getByRole('link', { name: '記事を読む' })
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
