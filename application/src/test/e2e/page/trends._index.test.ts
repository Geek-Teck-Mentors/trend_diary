import { expect, test } from '@playwright/test'
import { ArticleDrawer } from '@/test/e2e/pom/components/article-drawer'
import { DesktopMediaFilter } from '@/test/e2e/pom/components/desktop-media-filter'
import { TrendsPage } from '@/test/e2e/pom/trends-page'
import * as articleHelper from '@/test/helper/article'

const ARTICLE_COUNT = 10

test.describe('記事一覧ページ', () => {
  test.beforeEach(async ({ page }) => {
    const trendsPage = new TrendsPage(page)
    await trendsPage.goto()
  })

  test.describe('記事がない場合', () => {
    test('記事がないと表示される', async ({ page }) => {
      const trendsPage = new TrendsPage(page)
      await trendsPage.expectNoArticlesMessage()
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
      const trendsPage = new TrendsPage(page)
      await trendsPage.waitForArticleCards()
    })

    test('記事一覧から記事詳細を閲覧し、再び記事一覧に戻る', async ({ page }) => {
      const trendsPage = new TrendsPage(page)
      const articleCard = trendsPage.firstArticleCard()
      await expect(articleCard).toBeVisible()

      await trendsPage.openFirstArticle()

      const drawer = new ArticleDrawer(page)
      await drawer.waitOpen()
      await drawer.close()
      await drawer.expectClosed()

      // 記事一覧に戻っていることを確認(記事カードが表示されていること)
      await expect(articleCard).toBeVisible()
    })

    test('記事一覧から記事詳細を閲覧し、その実際の記事を閲覧する', async ({ page }) => {
      const drawer = new ArticleDrawer(page)
      await drawer.mockWindowOpen()

      const trendsPage = new TrendsPage(page)
      await trendsPage.openFirstArticle()
      await drawer.waitOpen()
      await drawer.clickReadArticle()
      const openedUrl = await drawer.getLastOpenedUrl()

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
      const trendsPage = new TrendsPage(page)
      await trendsPage.waitForArticleCards()
    })

    test('メディアフィルターが表示される', async ({ page }) => {
      const mediaFilter = new DesktopMediaFilter(page)
      await mediaFilter.expectVisible()
    })

    test('初期状態では全ての記事が表示される', async ({ page }) => {
      const trendsPage = new TrendsPage(page)
      await trendsPage.expectArticleCount(QIITA_COUNT + ZENN_COUNT)
    })

    test('Qiitaを選択しても適用前は記事一覧に反映されない', async ({ page }) => {
      const mediaFilter = new DesktopMediaFilter(page)
      await mediaFilter.select('qiita')

      const trendsPage = new TrendsPage(page)
      await trendsPage.waitForUrl(/\/trends$/)
      await trendsPage.expectArticleCount(QIITA_COUNT + ZENN_COUNT)
    })

    test('Qiitaを選択して適用すると、Qiita記事のみが表示される', async ({ page }) => {
      const mediaFilter = new DesktopMediaFilter(page)
      await mediaFilter.select('qiita')
      await mediaFilter.apply()

      const trendsPage = new TrendsPage(page)
      await trendsPage.waitForUrl(/\/trends\?media=qiita$/)
      await trendsPage.expectArticleCount(QIITA_COUNT)
      await trendsPage.expectQiitaIconCount(QIITA_COUNT)
    })

    test('Zennを選択して適用すると、Zenn記事のみが表示される', async ({ page }) => {
      const mediaFilter = new DesktopMediaFilter(page)
      await mediaFilter.select('zenn')
      await mediaFilter.apply()

      const trendsPage = new TrendsPage(page)
      await trendsPage.waitForUrl(/\/trends\?media=zenn$/)
      await trendsPage.expectArticleCount(ZENN_COUNT)
      await trendsPage.expectZennIconCount(ZENN_COUNT)
    })

    test('クリアを押すと即時反映で全記事が表示される', async ({ page }) => {
      const mediaFilter = new DesktopMediaFilter(page)
      await mediaFilter.select('qiita')
      await mediaFilter.apply()

      const trendsPage = new TrendsPage(page)
      await trendsPage.waitForUrl(/\/trends\?media=qiita$/)
      await trendsPage.expectArticleCount(QIITA_COUNT)

      await mediaFilter.clear()
      await trendsPage.waitForUrl(/\/trends$/)
      await trendsPage.expectArticleCount(QIITA_COUNT + ZENN_COUNT)
    })

    test('適用時にページがリセットされる', async ({ page }) => {
      const trendsPage = new TrendsPage(page)
      await trendsPage.goto('/trends?page=2')
      await page.waitForLoadState('networkidle')

      const mediaFilter = new DesktopMediaFilter(page)
      await mediaFilter.select('qiita')
      await mediaFilter.apply()
      await trendsPage.waitForUrl(/\/trends\?media=qiita$/)
      trendsPage.expectQueryParamNull('page')
    })

    test('クリア時にページがリセットされる', async ({ page }) => {
      const trendsPage = new TrendsPage(page)
      await trendsPage.goto('/trends?media=qiita&page=2')
      await page.waitForLoadState('networkidle')

      const mediaFilter = new DesktopMediaFilter(page)
      await mediaFilter.clear()
      await trendsPage.waitForUrl(/\/trends$/)
      trendsPage.expectQueryParamNull('page')
      trendsPage.expectQueryParamNull('media')
    })
  })
})
