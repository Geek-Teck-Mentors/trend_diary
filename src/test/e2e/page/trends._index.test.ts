import { expect, test } from "@playwright/test";
import { faker } from "@faker-js/faker";
import accountTestHelper from "@/test/helper/accountTestHelper";
import articleTestHelper from "@/test/helper/articleTestHelper";

const ARTICLE_COUNT = 10;

test.describe("記事一覧ページ", () => {
  test.describe.configure({ mode: 'default' })
  let articleData: {
    media: string;
    title: string;
    author: string;
    description: string;
    url: string;
  }[] = [];

  // テストアカウントの情報
  const testEmail = faker.internet.email();
  const testPassword = faker.internet.password();

  test.beforeAll(async () => {
    await accountTestHelper.cleanUp();
    await articleTestHelper.cleanUpArticles();
    await accountTestHelper.create(testEmail, testPassword);
  });

  test.afterAll(async () => {
    await accountTestHelper.cleanUp();
    await articleTestHelper.cleanUpArticles();
    await accountTestHelper.disconnect();
    await articleTestHelper.disconnect();
  });

  test.beforeEach(async ({ page }) => {
    // 1. まずはアカウントを作成
    await accountTestHelper.create(testEmail, testPassword);

    // 2. まず記事データを作成し、完了を待つ
    articleData = await Promise.all(
      Array.from({ length: ARTICLE_COUNT }, (_, i) =>
        articleTestHelper.createArticle(),
      ),
    );

    // 3. セッションクリア
    await page.context().clearCookies();

    // 4. ログイン
    await page.goto("/login");
    await page.getByLabel("メールアドレス").fill(testEmail);
    await page.getByLabel("パスワード").fill(testPassword);
    await page.getByRole("button", { name: "ログイン" }).click();

    // 5. ページ遷移を待機
    await page.waitForURL("/trends", { timeout: 10000 });
  });

  test.afterEach(async () => {
    await articleTestHelper.cleanUpArticles();
    await accountTestHelper.cleanUp();
  });

  test.describe("単体テスト", () => {
    test("表示と基本要素の確認", async ({ page }) => {
      // ページタイトルを確認
      const today = new Date().toLocaleDateString("ja-JP");
      await expect(
        page.getByRole("heading", {
          name: new RegExp(`- ${today.replace(/\//g, "\\/")} -`),
        }),
      ).toBeVisible();
      await expect(page).toHaveTitle(/.*トレンド一覧.*/);
    });
    test.describe("記事一覧の検証", () => {
      test("表示と要素の確認", async ({ page }) => {
        // 記事カードが表示されるまで待機
        await page.waitForSelector('[data-slot="card"]', { timeout: 10000 });

        // 記事が存在することを確認
        const articleCards = page.locator('[data-slot="card"]');
        const articleCard = articleCards.first();
        await expect(articleCard).toBeVisible();
      });

      test.describe("記事がない時の挙動", () => {
        test.beforeEach(async ({ page }) => {
          await articleTestHelper.cleanUpArticles();
          // ページを再読み込みしてデータを反映
          await page.reload();
        });
        test("表示と要素の確認", async ({ page }) => {
          // 記事の読み込みを待機
          await page.waitForLoadState();

          // 記事がない場合は「記事がありません」が表示されることを確認
          await expect(page.getByText("記事がありません")).toBeVisible();
        });
      });
    });

    test.describe("記事カードの検証", () => {
      test("表示と要素の確認", async ({ page }) => {
        // 記事カードが表示されるまで待機
        await page.waitForSelector('[data-slot="card"]', { timeout: 10000 });

        const articleCards = page.locator('[data-slot="card"]');
        const articleCard = articleCards.first();

        // 記事カードにtitleが表示されているか
        await expect(
          articleCard.locator('[data-slot="card-title"]'),
        ).toBeVisible();
        await expect(
          articleCard.locator('[data-slot="media-icon"]'),
        ).toBeVisible();
        await expect(
          articleCard.locator('[data-slot="card-title-content"]'),
        ).toBeVisible();
        // 記事カードにauthorが表示されているか
        await expect(
          articleCard.locator('[data-slot="card-description"]'),
        ).toBeVisible();
        await expect(
          articleCard.locator('[data-slot="card-description-author"]'),
        ).toBeVisible();
      });

      test("カードのクリックの検証", async ({ page }) => {
        await page.waitForSelector('[data-slot="card"]', { timeout: 10000 });
        const articleCards = page.locator('[data-slot="card"]');

        await articleCards.first().click();

        // ドロワーが開いていることを確認
        await page.waitForSelector('[data-slot="drawer-content"]', {
          timeout: 10000,
        });
        await expect(
          page.locator('[data-slot="drawer-content"]'),
        ).toBeVisible();
      });
    });

    test.describe("ドロワーの検証", () => {
      test.beforeEach(async ({ page }) => {
        await page.waitForSelector('[data-slot="card"]', {
          timeout: 10000,
        });
        const articleCards = page.locator('[data-slot="card"]');

        await articleCards.first().click();

        await page.waitForSelector('[data-slot="drawer-content"]', {
          timeout: 10000,
        });
      });

      test("表示と要素の確認", async ({ page }) => {
        const drawer = page.locator('[data-slot="drawer-content"]');

        // media iconが表示されていることを確認
        await expect(
          drawer.locator('[data-slot="drawer-header"]'),
        ).toBeVisible();
        await expect(
          drawer.locator('[data-slot="drawer-header-icon"]'),
        ).toBeVisible();

        // 閉じるボタンが表示されていることを確認
        await expect(
          drawer.locator('[data-slot="drawer-close"]'),
        ).toBeVisible();

        // titleが表示されていることを確認
        await expect(
          drawer.locator('[data-slot="drawer-title"]'),
        ).toBeVisible();

        // 記事の作成日が表示されていることを確認
        await expect(
          drawer.locator('[data-slot="drawer-content-meta"]'),
        ).toBeVisible();

        // 記事の著者が表示されていることを確認
        await expect(
          drawer.locator('[data-slot="drawer-content-author"]'),
        ).toBeVisible();

        // 記事のdescriptionが表示されていることを確認
        await expect(
          drawer.locator('[data-slot="drawer-content-description"]'),
        ).toBeVisible();
        await expect(
          drawer.locator('[data-slot="drawer-content-description-content"]'),
        ).toBeVisible();

        // 記事を読むリンクが表示されていることを確認
        await expect(
          drawer.locator('[data-slot="drawer-content-link"]'),
        ).toBeVisible();
      });

      test("ドロワー外のクリックの検証", async ({ page }) => {
        // ドロワー外をクリックしたときに、ドロワーが閉じることを確認
        await page.locator("body").click({ position: { x: 100, y: 100 } });

        // アニメーションのために少し待機
        await page.waitForTimeout(500);

        await expect(
          page.locator('[data-slot="drawer-content"]'),
        ).not.toBeVisible();
      });
    });
  });

  test.describe("結合テスト", () => {
    test("記事一覧のデータと表示の照合", async ({ page }) => {
      await page.waitForSelector('[data-slot="card"]', { timeout: 10000 });

      const articleCards = page.locator('[data-slot="card"]');

      // articleDataの記事の中のいずれかが表示されていることを確認
      const allTitles = articleData.map((article) => article.title);
      const displayedTitle = await articleCards
        .first()
        .locator("[data-slot=card-title-content]")
        .textContent();
      expect(allTitles).toContain(displayedTitle);

      // articleDataの記事の中のauthorが表示されていることを確認
      const allAuthors = articleData.map((article) => article.author);
      const displayedAuthor = await articleCards
        .first()
        .locator("[data-slot=card-description-author]")
        .textContent();
      expect(allAuthors).toContain(displayedAuthor);
    });

    test("ドロワーのデータと表示の照合", async ({ page }) => {
      await page.waitForSelector('[data-slot="card"]', { timeout: 10000 });
      const articleCards = page.locator('[data-slot="card"]');
      await articleCards.first().click();

      await page.waitForSelector('[data-slot="drawer-content"]', {
        timeout: 10000,
      });

      const drawer = page.locator('[data-slot="drawer-content"]');

      // articleDataのtitleが表示されていることを確認
      const allTitles = articleData.map((article) => article.title);
      const displayedTitle = await drawer
        .locator('[data-slot="drawer-title"]')
        .textContent();
      expect(allTitles).toContain(displayedTitle);

      // articleDataのauthorが表示されていることを確認
      const allAuthors = articleData.map((article) => article.author);
      const displayedAuthor = await drawer
        .locator('[data-slot="drawer-content-author"]')
        .textContent();
      expect(allAuthors).toContain(displayedAuthor);

      // articleDataのdescriptionが表示されていることを確認
      const allDescriptions = articleData.map((article) => article.description);
      const displayedDescription = await drawer
        .locator('[data-slot="drawer-content-description-content"]')
        .textContent();
      expect(allDescriptions).toContain(displayedDescription);

      // articleDataのurlが表示されていることを確認
      const allUrls = articleData.map((article) => article.url);
      const displayedUrl = await drawer
        .locator('[data-slot="drawer-content-link"]')
        .getAttribute("href");
      expect(allUrls).toContain(displayedUrl);
    });
  });
});
