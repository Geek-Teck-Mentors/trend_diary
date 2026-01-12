import { expect, Locator, Page, test } from '@playwright/test'
import * as articleHelper from '@/test/helper/article'

const ARTICLE_COUNT = 10
const TIMEOUT = 10000

test.describe('記事一覧ページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/trends')
  })

  test.describe('記事がない場合', () => {
    test('記事がないと表示される', async ({ page }) => {
      await expect(page.getByText('記事がありません')).toBeVisible({ timeout: TIMEOUT })
    })
  })

  test.describe('記事がある場合', () => {
    const createdArticleIds: bigint[] = []

    test.beforeAll(async () => {
      // 記事を作成
      const articles = await Promise.all(
        Array.from({ length: ARTICLE_COUNT }, () => articleHelper.createArticle()),
      )
      createdArticleIds.push(...articles.map((a) => a.articleId))
    })

    test.afterAll(async () => {
      // テスト後に記事をクリーンアップ
      await articleHelper.cleanUp(createdArticleIds)
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
      // 記事カードの存在を確認
      const articleCards = page.locator('[data-slot="card"]')
      const articleCard = articleCards.first()
      await expect(articleCard).toBeVisible()

      await articleCard.click()

      const drawer = await waitDrawerOpen(page)
      await drawer.getByRole('button', { name: 'Close' }).click()

      // ドロワーが閉じるのを待機
      await page.getByRole('dialog').waitFor({
        state: 'detached',
        timeout: TIMEOUT,
      })

      // 記事一覧に戻っていることを確認(記事カードが表示されていること)
      await expect(articleCard).toBeVisible()
      // ドロワーが閉じていることを確認
      await expect(page.getByRole('dialog')).not.toBeVisible()
    })

    test('記事一覧から記事詳細を閲覧し、その実際の記事を閲覧する', async ({ page }) => {
      // window.openをモックして、開かれたURLを記録
      let openedUrl = ''
      await page.evaluate(() => {
        window.open = (url: string | URL | undefined) => {
          if (url) {
            // biome-ignore lint/suspicious/noExplicitAny: E2Eテストでのwindow拡張のため
            ;(window as any).__lastOpenedUrl = url.toString()
          }
          return null
        }
      })

      // 記事カードをクリック
      const articleCard = page.locator('[data-slot="card"]').first()
      await articleCard.click()

      const drawer = await waitDrawerOpen(page)
      const drawerButton = drawer.getByRole('button', { name: '記事を読む' })
      await expect(drawerButton).toBeVisible()

      // ボタンをクリック
      await drawerButton.click()

      // window.openで開かれたURLを取得
      // biome-ignore lint/suspicious/noExplicitAny: E2Eテストでのwindow拡張のため
      openedUrl = await page.evaluate(() => (window as any).__lastOpenedUrl)

      // 記事URLが開かれることを確認
      expect(openedUrl).toMatch(/zenn\.dev|qiita\.com/)
    })
  })

  test.describe('メディアフィルター機能', () => {
    const QIITA_COUNT = 5
    const ZENN_COUNT = 3
    const createdArticleIds: bigint[] = []

    test.beforeAll(async () => {
      // Qiita記事を作成
      const qiitaArticles = await Promise.all(
        Array.from({ length: QIITA_COUNT }, () => articleHelper.createArticle({ media: 'qiita' })),
      )
      createdArticleIds.push(...qiitaArticles.map((a) => a.articleId))

      // Zenn記事を作成
      const zennArticles = await Promise.all(
        Array.from({ length: ZENN_COUNT }, () => articleHelper.createArticle({ media: 'zenn' })),
      )
      createdArticleIds.push(...zennArticles.map((a) => a.articleId))
    })

    test.afterAll(async () => {
      await articleHelper.cleanUp(createdArticleIds)
    })

    test.beforeEach(async ({ page }) => {
      await page.goto('/trends')
      // カードが表示されるのを待機
      await page.locator("[data-slot='card']").nth(0).waitFor({ timeout: TIMEOUT })
    })

    test('メディアフィルタートリガーが表示される', async ({ page }) => {
      const filterTrigger = page.locator('[data-slot="media-filter-trigger"]')
      await filterTrigger.waitFor({ state: 'visible', timeout: TIMEOUT })
      await expect(filterTrigger).toBeVisible()

      // デフォルトでは「すべて」が表示されている
      await expect(filterTrigger).toContainText('すべて')
    })

    test('初期状態では全ての記事が表示される', async ({ page }) => {
      // 記事カードの数を確認（Qiita + Zenn）
      const articleCards = page.locator('[data-slot="card"]')
      await expect(articleCards).toHaveCount(QIITA_COUNT + ZENN_COUNT)
    })

    test('Qiitaフィルターを選択すると、Qiita記事のみが表示される', async ({ page }) => {
      // ドロップダウントリガーをクリック
      const filterTrigger = page.locator('[data-slot="media-filter-trigger"]')
      await filterTrigger.waitFor({ state: 'visible', timeout: TIMEOUT })
      await filterTrigger.click()

      // Qiitaメニューアイテムをクリック
      const qiitaOption = page.locator('[data-slot="media-filter-qiita"]')
      await qiitaOption.waitFor({ state: 'visible', timeout: TIMEOUT })
      await qiitaOption.click()

      // URLパラメータが変更されるのを待機
      await page.waitForURL('**/trends?media=qiita', { timeout: TIMEOUT })

      // 記事カードの数を確認
      const articleCards = page.locator('[data-slot="card"]')
      await expect(articleCards).toHaveCount(QIITA_COUNT)

      // 全てのカードにQiitaアイコンが表示されることを確認
      const qiitaIcons = page.locator('img[src="/images/qiita-icon.png"]')
      await expect(qiitaIcons).toHaveCount(QIITA_COUNT)
    })

    test('Zennフィルターを選択すると、Zenn記事のみが表示される', async ({ page }) => {
      // ドロップダウントリガーをクリック
      const filterTrigger = page.locator('[data-slot="media-filter-trigger"]')
      await filterTrigger.waitFor({ state: 'visible', timeout: TIMEOUT })
      await filterTrigger.click()

      // Zennメニューアイテムをクリック
      const zennOption = page.locator('[data-slot="media-filter-zenn"]')
      await zennOption.waitFor({ state: 'visible', timeout: TIMEOUT })
      await zennOption.click()

      // URLパラメータが変更されるのを待機
      await page.waitForURL('**/trends?media=zenn', { timeout: TIMEOUT })

      // 記事カードの数を確認
      const articleCards = page.locator('[data-slot="card"]')
      await expect(articleCards).toHaveCount(ZENN_COUNT)

      // 全てのカードにZennアイコンが表示されることを確認
      const zennIcons = page.locator('img[src="/images/zenn-icon.svg"]')
      await expect(zennIcons).toHaveCount(ZENN_COUNT)
    })

    test('Qiitaフィルター選択後、すべてフィルターを選択すると全記事が表示される', async ({
      page,
    }) => {
      // まずQiitaフィルターを選択
      const filterTrigger = page.locator('[data-slot="media-filter-trigger"]')
      await filterTrigger.waitFor({ state: 'visible', timeout: TIMEOUT })
      await filterTrigger.click()

      const qiitaOption = page.locator('[data-slot="media-filter-qiita"]')
      await qiitaOption.waitFor({ state: 'visible', timeout: TIMEOUT })
      await qiitaOption.click()
      await page.waitForURL('**/trends?media=qiita', { timeout: TIMEOUT })

      // Qiita記事のみ表示されることを確認
      const qiitaArticleCards = page.locator('[data-slot="card"]')
      await expect(qiitaArticleCards).toHaveCount(QIITA_COUNT)

      // すべてフィルターを選択
      await filterTrigger.click()
      const allOption = page.locator('[data-slot="media-filter-all"]')
      await allOption.waitFor({ state: 'visible', timeout: TIMEOUT })
      await allOption.click()

      // URLパラメータからmediaが削除されるのを待機
      await page.waitForURL('**/trends', { timeout: TIMEOUT })

      // 全記事が表示されることを確認
      const allArticleCards = page.locator('[data-slot="card"]')
      await expect(allArticleCards).toHaveCount(QIITA_COUNT + ZENN_COUNT)
    })

    test('フィルター切り替え時にページがリセットされる', async ({ page }) => {
      // ページ2に移動
      await page.goto('/trends?page=2')
      await page.waitForLoadState('networkidle')

      // Qiitaフィルターを選択
      const filterTrigger = page.locator('[data-slot="media-filter-trigger"]')
      await filterTrigger.waitFor({ state: 'visible', timeout: TIMEOUT })
      await filterTrigger.click()

      const qiitaOption = page.locator('[data-slot="media-filter-qiita"]')
      await qiitaOption.waitFor({ state: 'visible', timeout: TIMEOUT })
      await qiitaOption.click()

      // ページ番号がリセットされることを確認
      await page.waitForURL('**/trends?media=qiita', { timeout: TIMEOUT })
      const url = new URL(page.url())
      expect(url.searchParams.get('page')).toBeNull()
    })
  })
})
