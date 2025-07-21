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
    await accountTestHelper.cleanUp()
    await articleTestHelper.cleanUpArticles()

    // 1. まずはアカウントを作成
    await accountTestHelper.create(testEmail, testPassword)

    // 2. アカウントがCI環境でも確実に存在するように1000ms待機
    await new Promise((resolve) => setTimeout(resolve, 1000))
  })

  test.afterAll(async () => {
    await accountTestHelper.cleanUp()
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

  test.describe('単体テスト', () => {
    test('共通する表示と基本要素の確認', async ({ page }) => {
      // ページのURLを確認
      await expect(page).toHaveURL('/trends')
      // ページタイトルの確認
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('h1')).toContainText(/-.*-/)
      await expect(page).toHaveTitle(/.*トレンド一覧.*/)
    })

    test.describe('記事がない場合', () => {
      test.beforeAll(async () => {
        // 記事を削除
        await articleTestHelper.cleanUpArticles()
      })
      test('固有の表示と要素の確認', async ({ page }) => {
        // 記事の読み込みを待機
        await page.waitForLoadState()

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
      test('固有の表示と要素の確認', async ({ page }) => {
        // 記事カードが表示されるまで待機
        await page.waitForSelector('[data-slot="card"]', { timeout: 10000 })

        // 記事が存在することを確認
        const articleCards = page.locator('[data-slot="card"]')
        const articleCard = articleCards.first()
        await expect(articleCard).toBeVisible()
      })

      test.describe('記事カード', () => {
        test('表示と要素の確認', async ({ page }) => {
          // 記事カードが表示されるまで待機
          await page.waitForSelector('[data-slot="card"]', { timeout: 10000 })

          const articleCards = page.locator('[data-slot="card"]')
          const articleCard = articleCards.first()

          // 記事カードにtitleが表示されているか
          await expect(articleCard.locator('[data-slot="card-title"]')).toBeVisible()
          await expect(articleCard.locator('[data-slot="media-icon"]')).toBeVisible()
          await expect(articleCard.locator('[data-slot="card-title-content"]')).toBeVisible()
          // 記事カードにauthorが表示されているか
          await expect(articleCard.locator('[data-slot="card-description"]')).toBeVisible()
          await expect(articleCard.locator('[data-slot="card-description-author"]')).toBeVisible()
        })

        test('カードのクリック後ドロワーが開く', async ({ page }) => {
          await page.waitForSelector('[data-slot="card"]', { timeout: 10000 })
          const articleCards = page.locator('[data-slot="card"]')

          await articleCards.first().click()

          // ドロワーが開いていることを確認
          await page.waitForSelector('[data-slot="drawer-content"]', {
            timeout: 10000,
          })
          await expect(page.locator('[data-slot="drawer-content"]')).toBeVisible()
        })
      })

      test.describe('ドロワー', () => {
        test.beforeEach(async ({ page }) => {
          await page.waitForSelector('[data-slot="card"]', {
            timeout: 10000,
          })
          const articleCards = page.locator('[data-slot="card"]')

          await articleCards.first().click()

          await page.waitForSelector('[data-slot="drawer-content"]', {
            timeout: 10000,
          })
        })

        test('表示と要素の確認', async ({ page }) => {
          const drawer = page.locator('[data-slot="drawer-content"]')

          // media iconが表示されていることを確認
          await expect(drawer.locator('[data-slot="drawer-header"]')).toBeVisible()
          await expect(drawer.locator('[data-slot="drawer-header-icon"]')).toBeVisible()

          // 閉じるボタンが表示されていることを確認
          await expect(drawer.locator('[data-slot="drawer-close"]')).toBeVisible()

          // titleが表示されていることを確認
          await expect(drawer.locator('[data-slot="drawer-title"]')).toBeVisible()

          // 記事の作成日が表示されていることを確認
          await expect(drawer.locator('[data-slot="drawer-content-meta"]')).toBeVisible()

          // 記事の著者が表示されていることを確認
          await expect(drawer.locator('[data-slot="drawer-content-author"]')).toBeVisible()

          // 記事のdescriptionが表示されていることを確認
          await expect(drawer.locator('[data-slot="drawer-content-description"]')).toBeVisible()
          await expect(
            drawer.locator('[data-slot="drawer-content-description-content"]'),
          ).toBeVisible()

          // 記事を読むリンクが表示されていることを確認
          await expect(drawer.locator('[data-slot="drawer-content-link"]')).toBeVisible()
        })

        test('ドロワー外をクリックするとドロワーが閉じる', async ({ page }) => {
          await page.locator('body').click({ position: { x: 100, y: 100 } })

          // アニメーションのために少し待機
          await page.waitForTimeout(500)

          await expect(page.locator('[data-slot="drawer-content"]')).not.toBeVisible()
        })
      })
    })
  })

  test.describe('結合テスト', () => {
    test.beforeAll(async () => {
      // 記事を作成
      await Promise.all(
        Array.from({ length: ARTICLE_COUNT }, (_, i) => articleTestHelper.createArticle()),
      )
    })
    test('ドロワーの記事へのリンクをクリックすると外部サイトの記事ページに遷移', async ({
      page,
    }) => {
      const ARTICLE_URL = 'https://example.com/article'
      // 記事カードが表示されるまで待機
      await page.waitForSelector('[data-slot="card"]', { timeout: 10000 })
      // 記事カードをクリック
      const articleCards = page.locator('[data-slot="card"]')
      await articleCards.first().click()
      // ドロワーが開くのを待機
      await page.waitForSelector('[data-slot="drawer-content"]', { timeout: 10000 })

      const drawer = page.locator('[data-slot="drawer-content"]')

      // ドロワーの記事を読むボタンを取得
      const drawerLink = drawer.locator('[data-slot="drawer-content-link"]')

      // ドロワーの記事を読むリンクのURLを上書き
      await drawerLink.evaluate((element, url) => {
        ;(element as HTMLAnchorElement).href = url
      }, ARTICLE_URL)

      // 記事を読むリンクをクリック
      await drawer.locator('[data-slot="drawer-content-link"]').click()

      // 新しいタブでそのリンクのページに遷移する
      const [newPage] = await Promise.all([
        page.context().waitForEvent('page'),
        page.waitForLoadState('networkidle'),
      ])

      await expect(newPage).toHaveURL(ARTICLE_URL)
    })
  })
})
