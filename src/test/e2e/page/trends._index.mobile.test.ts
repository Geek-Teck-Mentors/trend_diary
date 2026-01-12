import { expect, Locator, Page, test } from '@playwright/test'
import articleTestHelper from '@/test/helper/article'

const ARTICLE_COUNT = 10
const TIMEOUT = 10000
const MOBILE_VIEWPORT = { width: 375, height: 667 }

test.describe('記事一覧ページ(モバイル)', () => {
  test.use({ viewport: MOBILE_VIEWPORT })

  test.beforeAll(async () => {
    await articleTestHelper.cleanUp()
  })

  test.afterAll(async () => {
    await articleTestHelper.cleanUp()
    await articleTestHelper.disconnect()
  })

  test.beforeEach(async ({ page }) => {
    await page.goto('/trends')
  })

  test.describe('レイアウト確認', () => {
    test('AppHeaderが表示され、AppSidebarが非表示であること', async ({ page }) => {
      // AppHeaderが表示されていること
      const header = page.locator('header')
      await expect(header).toBeVisible()

      // ハンバーガーメニューボタンが表示されていること
      const menuButton = page.getByRole('button', { name: 'メニューを開く' })
      await expect(menuButton).toBeVisible()

      // AppSidebarが非表示であること(data-slot='sidebar'で判定)
      const sidebar = page.locator('[data-slot="sidebar"]')
      await expect(sidebar).not.toBeVisible()
    })

    test('ハンバーガーメニューを開いてメニュー項目が表示されること', async ({ page }) => {
      // ハンバーガーメニューを開く
      const menuButton = page.getByRole('button', { name: 'メニューを開く' })
      await menuButton.click()

      // Sheetが開くのを待機
      const sheet = page.getByRole('dialog')
      await expect(sheet).toBeVisible({ timeout: TIMEOUT })

      // Applicationラベルが表示されていること
      await expect(sheet.getByText('Application')).toBeVisible()

      // トレンド記事リンクが表示されていること
      await expect(sheet.getByRole('link', { name: 'トレンド記事' })).toBeVisible()
    })
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
        Array.from({ length: ARTICLE_COUNT }, () => articleTestHelper.createArticle()),
      )
    })

    test.afterAll(async () => {
      // テスト後に記事をクリーンアップ
      await articleTestHelper.cleanUp()
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

    test('記事カードがモバイルサイズで全幅表示されること', async ({ page }) => {
      // 記事カードの存在を確認
      const articleCard = page.locator('[data-slot="card"]').first()
      await expect(articleCard).toBeVisible()

      // カードの幅を取得(w-fullで375pxに近い値になるはず)
      const cardBox = await articleCard.boundingBox()
      expect(cardBox).not.toBeNull()
      if (cardBox) {
        // モバイル幅375pxから左右のpadding等を引いた値に近いことを確認
        // 完全一致ではなく、おおよそ全幅であることを確認
        expect(cardBox.width).toBeGreaterThan(300)
      }
    })

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

  test.describe('メディアフィルター機能(モバイル)', () => {
    const QIITA_COUNT = 5
    const ZENN_COUNT = 3

    test.beforeAll(async () => {
      await articleTestHelper.cleanUp()
      // Qiita記事を作成
      await Promise.all(
        Array.from({ length: QIITA_COUNT }, () =>
          articleTestHelper.createArticle({ media: 'qiita' }),
        ),
      )
      // Zenn記事を作成
      await Promise.all(
        Array.from({ length: ZENN_COUNT }, () =>
          articleTestHelper.createArticle({ media: 'zenn' }),
        ),
      )
    })

    test.afterAll(async () => {
      await articleTestHelper.cleanUp()
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
  })
})
