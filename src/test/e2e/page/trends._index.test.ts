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
  test.describe.configure({ mode: 'default' })

  // テストアカウントの情報
  const testEmail = 'test@example.com'
  const testPassword = 'password123'

  test.beforeAll(async () => {
    await accountTestHelper.cleanUp()
    await articleTestHelper.cleanUpArticles()
    await accountTestHelper.create(testEmail, testPassword)
    await accountTestHelper.login(testEmail, testPassword)
  })

  test.afterAll(async () => {
    await accountTestHelper.cleanUp()
    await articleTestHelper.cleanUpArticles()
    await accountTestHelper.disconnect()
    await articleTestHelper.disconnect()
  })

  test.beforeEach(async ({ page }) => {
    await page.goto('/trends')
  })

  test.describe('単体テスト', () => {
    test.describe('記事がない場合', () => {
      test('一覧表示の要素確認', async ({ page }) => {
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
      test.beforeEach(async ({ page }) => {
        // 記事データをクリアしてからseedデータを作成
        await articleTestHelper.cleanUpArticles()
        await articleTestHelper.createArticles(seedArticleData)

        // ページを再読み込みしてデータを反映
        await page.reload()
      })

      test('一覧表示の要素確認', async ({ page }) => {
        // ページタイトルを確認
        await expect(page).toHaveTitle(/.*トレンド一覧.*/)

        // ページの上側に日付が表示されていることを確認（動的日付対応）
        const today = new Date().toLocaleDateString('ja-JP')
        await expect(
          page.getByRole('heading', {
            name: new RegExp(`- ${today.replace(/\//g, '\\/')} -`),
          }),
        ).toBeVisible()

        // 記事カードが表示されていることを確認
        const articleCards = page.locator('[role="button"]').filter({ hasText: /.*/ })
        await expect(articleCards.first()).toBeVisible()

        // 記事のカードにはタイトル、執筆者、メディアのアイコンが表示されていることを確認
        const firstCard = articleCards.first()
        await expect(firstCard.locator('.line-clamp-2')).toBeVisible() // タイトル
        await expect(firstCard.locator('img')).toBeVisible() // メディアアイコン
        await expect(firstCard.locator('.text-sm.text-gray-600')).toBeVisible() // 執筆者

        // ページネーションが表示されることを確認
        await expect(page.getByText('前へ')).toBeVisible()
        await expect(page.getByText('次へ')).toBeVisible()
      })

      test.describe('記事クリックの検証', () => {
        test('カードのクリックの検証', async ({ page }) => {
          // 記事カードをクリックしたときに、ドロワーが開くことを確認
          const articleCards = page.locator('[role="button"]').filter({ hasText: /.*/ })
          const firstCard = articleCards.first()
          await firstCard.click()

          // ドロワーが開いていることを確認
          await expect(page.locator('[role="dialog"]')).toBeVisible()
        })

        test.describe('ドロワーの検証', () => {
          test.beforeEach(async ({ page }) => {
            // 各テストの前にドロワーを開く
            const articleCards = page.locator('[role="button"]').filter({ hasText: /.*/ })
            await articleCards.first().click()
            await expect(page.locator('[role="dialog"]')).toBeVisible()
          })

          test('ドロワー外のクリックの検証', async ({ page }) => {
            // ドロワー外をクリックしたときに、ドロワーが閉じることを確認
            await page.locator('body').click({ position: { x: 100, y: 100 } })
            await expect(page.locator('[role="dialog"]')).not.toBeVisible()
          })

          test('ドロワーには要素の確認', async ({ page }) => {
            const drawer = page.locator('[role="dialog"]')

            // タイトル、執筆者、メディアのアイコンが表示されていることを確認
            await expect(drawer.locator('h2')).toBeVisible() // タイトル
            // 執筆者情報の確認（具体的なクラス名やセレクタを使用）
            const authorElement = drawer
              .locator('div')
              .filter({ hasText: /田中太郎|佐藤花子|山田次郎|鈴木三郎|高橋四郎/ })
              .first()
            await expect(authorElement).toBeVisible()
            // メディアタグ（QiitaまたはZenn）が表示されていることを確認
            await expect(drawer.getByText(/Qiita|Zenn/)).toBeVisible()

            // 記事の概要が表示されていることを確認
            await expect(drawer.getByText('記事の概要')).toBeVisible()
            await expect(drawer.locator('p')).toBeVisible()

            // 一番下に「記事を読む」ボタン(外部へのリンク)が表示されていることを確認
            await expect(drawer.getByRole('link', { name: '記事を読む' })).toBeVisible()
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
      test.beforeEach(async ({ page }) => {
        // 記事データをクリアしてからseedデータを作成
        await articleTestHelper.cleanUpArticles()
        await articleTestHelper.createArticles(seedArticleData)

        // ページを再読み込みしてデータを反映
        await page.reload()
      })

      test('記事一覧の挙動', async ({ page }) => {
        // 一番上の日付は最新の日付が表示されている
        const today = new Date().toLocaleDateString('ja-JP')
        await expect(
          page.getByRole('heading', {
            name: new RegExp(`- ${today.replace(/\//g, '\\/')} -`),
          }),
        ).toBeVisible()

        // 記事の読み込みを待機
        await page.waitForTimeout(2000)

        // 記事一覧でAPIから取得した記事が表示されることを確認
        const articleCards = page.locator('[role="button"]').filter({ hasText: /.*/ })
        await expect(articleCards.first()).toBeVisible()

        // seedデータで作成した記事が表示されることを確認
        await expect(page.getByText('React hooks の基礎を学ぼう')).toBeVisible()
        await expect(page.getByText('TypeScript の型システムを理解する')).toBeVisible()
      })

      test('記事詳細ドロワーの挙動', async ({ page }) => {
        // 記事の読み込みを待機
        await page.waitForTimeout(2000)

        const articleCards = page.locator('[role="button"]').filter({ hasText: /.*/ })

        // 記事カードのタイトルを取得
        const cardTitle = await articleCards.first().locator('.line-clamp-2').textContent()

        // 記事カードをクリック
        await articleCards.first().click()

        // ドロワーが開いていることを確認
        const drawer = page.locator('[role="dialog"]')
        await expect(drawer).toBeVisible()

        // 記事ドロワーを開いたときに、APIで取得した記事通りの内容が表示されることを確認
        const drawerTitle = await drawer.locator('.text-xl.leading-relaxed.font-bold').textContent()
        expect(drawerTitle).toBe(cardTitle)

        // 外部リンクが正しく設定されていることを確認
        const readButton = drawer.getByRole('link', { name: '記事を読む' })
        await expect(readButton).toHaveAttribute('target', '_blank')
        await expect(readButton).toHaveAttribute('rel', 'noopener noreferrer nofollow')
      })

      test('pagingの挙動', async ({ page }) => {
        // 記事の読み込みを待機
        await page.waitForTimeout(2000)

        // 初期状態でページネーションボタンが表示されていることを確認
        const prevButton = page.locator('[aria-label="Go to previous page"]')
        const nextButton = page.locator('[aria-label="Go to next page"]')

        await expect(page.getByText('前へ')).toBeVisible()
        await expect(page.getByText('次へ')).toBeVisible()

        // 次のページボタンがクリック可能か確認
        const nextButtonEnabled = await nextButton.isEnabled()
        if (nextButtonEnabled) {
          // 次のページボタンをクリック
          await nextButton.click()

          // ページが更新されるまで待機
          await page.waitForTimeout(1000)

          // 記事が更新されていることを確認（loading状態を考慮）
          await expect(
            page
              .locator('[role="button"]')
              .filter({ hasText: /.*/ })
              .first()
              .or(page.getByText('記事がありません')),
          ).toBeVisible()

          // 前のページボタンがクリック可能になっていることを確認
          await expect(prevButton).toBeEnabled()

          // 前のページに戻るボタンをクリック
          await prevButton.click()

          // ページが更新されるまで待機
          await page.waitForTimeout(1000)

          // 記事が更新されていることを確認
          await expect(
            page
              .locator('[role="button"]')
              .filter({ hasText: /.*/ })
              .first()
              .or(page.getByText('記事がありません')),
          ).toBeVisible()
        }
      })
    })
  })
})
