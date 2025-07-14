import { expect, test } from '@playwright/test'
import accountTestHelper from '@/test/helper/accountTestHelper'
import articleTestHelper from '@/test/helper/articleTestHelper'

const seedArticleData = [
  {
    media: 'qiita' as const,
    title: 'React hooks の基礎を学ぼう',
    author: '田中太郎',
    description:
      'React hooks の基本的な使い方について解説します。useState, useEffect を中心に、実践的な例を交えて説明します。',
    url: 'https://qiita.example.com/example/react-hooks-basics',
  },
  {
    media: 'zenn' as const,
    title: 'TypeScript の型システムを理解する',
    author: '佐藤花子',
    description:
      'TypeScript の型システムについて詳しく解説します。Union型、Intersection型、ジェネリクスなど、実用的な型の活用方法を紹介します。',
    url: 'https://zenn.example.dev/example/typescript-type-system',
  },
  {
    media: 'qiita' as const,
    title: 'Next.js 14 の新機能を試してみた',
    author: '山田次郎',
    description:
      'Next.js 14 で追加された新機能を実際に試してみました。Server Components や App Router の使い方を解説します。',
    url: 'https://qiita.example.com/example/nextjs-14-features',
  },
  {
    media: 'zenn' as const,
    title: 'Prisma ORM の実践的な使い方',
    author: '鈴木三郎',
    description:
      'Prisma ORM を使った実際のプロジェクトでの実装方法を紹介します。マイグレーション、リレーション、パフォーマンス最適化について説明します。',
    url: 'https://zenn.example.dev/example/prisma-orm-practice',
  },
  {
    media: 'qiita' as const,
    title: 'Playwright でE2Eテストを効率化する',
    author: '高橋四郎',
    description:
      'Playwright を使った効率的なE2Eテストの書き方を解説します。Page Object Model パターンや並列実行のテクニックを紹介します。',
    url: 'https://qiita.example.com/example/playwright-e2e-testing',
  },
]

// ページに対して、単体・結合テストを実施します
// 単体テストでは、API関連のページの表示と基本要素を確認します
// 結合テストでは、画面遷移に伴うAPIを含む挙動を確認します
test.describe('記事一覧ページ', () => {
  test.describe.configure({ mode: 'serial' })

  // テストアカウントの情報
  // loginのe2eと重複しないように、trendsテスト用のメールアドレスとパスワードを設定
  const testEmail = 'trends_test@example.com'
  const testPassword = 'password123'

  test.beforeAll(async () => {
    await accountTestHelper.cleanUp()
    await articleTestHelper.cleanUpArticles()
    await accountTestHelper.create(testEmail, testPassword)
  })

  test.afterAll(async () => {
    await accountTestHelper.cleanUp()
    await articleTestHelper.cleanUpArticles()
    await accountTestHelper.disconnect()
    await articleTestHelper.disconnect()
  })

  test.beforeEach(async ({ page }) => {
    // 1. まず記事データを作成し、完了を待つ
    await articleTestHelper.createArticles(seedArticleData)

    // 2. セッションクリア
    await page.context().clearCookies()

    // 3. ログイン
    await page.goto('/login')
    await page.getByLabel('メールアドレス').fill(testEmail)
    await page.getByLabel('パスワード').fill(testPassword)
    await page.getByRole('button', { name: 'ログイン' }).click()

    // 4. ページ遷移を待機
    await page.waitForURL('/trends', { timeout: 10000 })

    // 5. APIレスポンス待機を追加
    await page.waitForResponse(
      (response) => response.url().includes('/api/articles') && response.status() === 200,
    )
  })

  test.afterEach(async () => {
    await articleTestHelper.cleanUpArticles()
  })

  test.describe('単体テスト', () => {
    test.describe('記事がない場合', () => {
      test.beforeEach(async ({ page }) => {
        await articleTestHelper.cleanUpArticles()
        // ページを再読み込みしてデータを反映
        await page.reload()
      })

      test('一覧表示の要素確認', async ({ page }) => {
        // 記事の読み込みを待機
        await page.waitForLoadState()
        // ページタイトルを確認
        await expect(page).toHaveTitle(/.*トレンド一覧.*/)

        // ページの上側に日付が表示されていることを確認（動的日付対応）
        const today = new Date().toLocaleDateString('ja-JP')
        await expect(
          page.getByRole('heading', {
            name: new RegExp(`- ${today.replace(/\//g, '\\/')} -`),
          }),
        ).toBeVisible()

        // 記事がない場合は「記事がありません」が表示されることを確認
        await expect(page.getByText('記事がありません')).toBeVisible()

        // ページネーションは表示されない
        await expect(page.getByText('前へ')).not.toBeVisible()
        await expect(page.getByText('次へ')).not.toBeVisible()
      })
    })

    test.describe('記事がある場合', () => {
      test.describe.configure({ mode: 'default' })
      test('一覧表示の要素確認', async ({ page }) => {
        await page.waitForTimeout(10000)
        // ページタイトルを確認
        await expect(page).toHaveTitle(/.*トレンド一覧.*/)

        // ページの上側に日付が表示されていることを確認（動的日付対応）
        const today = new Date().toLocaleDateString('ja-JP')
        await expect(
          page.getByRole('heading', {
            name: new RegExp(`- ${today.replace(/\//g, '\\/')} -`),
          }),
        ).toBeVisible()

        // 記事が存在することを確認
        const articleCards = page.locator('[data-slot="card"]')
        const articleCard = articleCards.first()
        await expect(articleCard).toBeVisible()
        // 記事カードにtitleが表示されているか
        await expect(articleCard.locator('[data-slot="card-title"]')).toBeVisible()
        await expect(articleCard.locator('[data-slot="media-icon"]')).toBeVisible()
        await expect(articleCard.locator('[data-slot="card-title-content"]')).toBeVisible()
        // 記事カードにauthorが表示されているか
        await expect(articleCard.locator('[data-slot="card-description"]')).toBeVisible()
        await expect(articleCard.locator('[data-slot="card-description-author"]')).toBeVisible()
      })

      test.describe('記事クリックの検証', () => {
        test('カードのクリックの検証', async ({ page }) => {
          await page.waitForSelector('[data-slot="card"]')
          const articleCards = page.locator('[data-slot="card"]')

          await articleCards.first().click()

          // ドロワーが開いていることを確認
          await expect(page.locator('[data-slot="drawer-content"]')).toBeVisible()
        })

        test.describe('ドロワーの検証', () => {
          test.beforeEach(async ({ page }) => {
            await page.waitForSelector('[data-slot="card"]')
            const articleCards = page.locator('[data-slot="card"]')

            await articleCards.first().click()

            await page.waitForSelector('[data-slot="drawer-content"]')
          })

          test('ドロワー外のクリックの検証', async ({ page }) => {
            // ドロワー外をクリックしたときに、ドロワーが閉じることを確認
            await page.locator('body').click({ position: { x: 100, y: 100 } })

            // アニメーションのために少し待機
            await page.waitForTimeout(500)

            await expect(page.locator('[data-slot="drawer-content"]')).not.toBeVisible()
          })

          test('ドロワーには要素の確認', async ({ page }) => {
            const drawer = page.locator('[data-slot="drawer-content"]')

            // media tagが表示されていることを確認
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
        })
      })
    })
  })

  test.describe('結合テスト', () => {
    test.describe('記事がない場合', () => {
      test.beforeEach(async ({ page }) => {
        // 記事データをクリア
        await articleTestHelper.cleanUpArticles()
        // ページを再読み込みしてデータを反映
        await page.reload()
        // 記事の読み込みを待機
        await page.waitForLoadState()
      })

      test('記事一覧の挙動', async ({ page }) => {
        // 一番上の日付は最新の日付が表示されている
        const today = new Date().toLocaleDateString('ja-JP')
        await expect(
          page.getByRole('heading', {
            name: new RegExp(`- ${today.replace(/\//g, '\\/')} -`),
          }),
        ).toBeVisible()

        // 記事が存在しない場合、メッセージが表示されることを確認
        await expect(page.getByText('記事がありません')).toBeVisible()
      })
    })

    test.describe('記事がある場合', () => {
      test('記事一覧の挙動', async ({ page }) => {
        // 一番上の日付は最新の日付が表示されている
        const today = new Date().toLocaleDateString('ja-JP')
        await expect(
          page.getByRole('heading', {
            name: new RegExp(`- ${today.replace(/\//g, '\\/')} -`),
          }),
        ).toBeVisible()

        await page.waitForSelector('[data-slot="card"]')

        const articleCards = page.locator('[data-slot="card"]')

        // seedArticleDataの記事の中のいずれかが表示されていることを確認
        const allTitles = seedArticleData.map((article) => article.title)
        const displayedTitle = await articleCards
          .first()
          .locator('[data-slot=card-title-content]')
          .textContent()
        expect(allTitles).toContain(displayedTitle)

        // seedArticleDataの記事の中のauthorが表示されていることを確認
        const allAuthors = seedArticleData.map((article) => article.author)
        const displayedAuthor = await articleCards
          .first()
          .locator('[data-slot=card-description-author]')
          .textContent()
        expect(allAuthors).toContain(displayedAuthor)
      })

      test('記事詳細ドロワーの挙動', async ({ page }) => {
        const articleCards = page.locator('[data-slot="card"]')
        await articleCards.first().click()

        await page.waitForSelector('[data-slot="drawer-content"]')

        const drawer = page.locator('[data-slot="drawer-content"]')

        // seedArticleDataのtitleが表示されていることを確認
        const allTitles = seedArticleData.map((article) => article.title)
        const displayedTitle = await drawer.locator('[data-slot="drawer-title"]').textContent()
        expect(allTitles).toContain(displayedTitle)

        // seedArticleDataのauthorが表示されていることを確認
        const allAuthors = seedArticleData.map((article) => article.author)
        const displayedAuthor = await drawer
          .locator('[data-slot="drawer-content-author"]')
          .textContent()
        expect(allAuthors).toContain(displayedAuthor)

        // seedArticleDataのdescriptionが表示されていることを確認
        const allDescriptions = seedArticleData.map((article) => article.description)
        const displayedDescription = await drawer
          .locator('[data-slot="drawer-content-description-content"]')
          .textContent()
        expect(allDescriptions).toContain(displayedDescription)

        // seedArticleDataのurlが表示されていることを確認
        const allUrls = seedArticleData.map((article) => article.url)
        const displayedUrl = await drawer
          .locator('[data-slot="drawer-content-link"]')
          .getAttribute('href')
        expect(allUrls).toContain(displayedUrl)
      })
    })
  })
})
