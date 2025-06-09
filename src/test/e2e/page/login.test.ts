import { test, expect } from '@playwright/test';

// ページに対して、単体・結合テストを実施します
// 単体テストでは、API関連のページの表示と基本要素を確認します
// 結合テストでは、画面遷移に伴うAPIを含む挙動を確認します
test.describe('ログインページ', () => {
  test.describe('単体テスト', () => {
    test('表示と基本要素の確認', async ({ page }) => {
      await page.goto('/login');

      // ページタイトルを確認
      await expect(page).toHaveTitle(/.*ログイン.*/);

      // 基本要素の存在確認
      await expect(page.getByText('ログイン').first()).toBeVisible();
      await expect(page.getByText('メールアドレス')).toBeVisible();
      await expect(page.getByText('パスワード')).toBeVisible();
      await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible();
      await expect(page.getByText('アカウントをお持ちでないですか？')).toBeVisible();
      await expect(page.getByText('アカウント作成')).toBeVisible();
    });

    test('アカウント作成ページへの遷移', async ({ page }) => {
      await page.goto('/login');

      // アカウント作成リンクをクリック
      await page.getByText('アカウント作成').click();

      // アカウント作成ページのタイトルを確認
      await expect(page).toHaveTitle(/.*アカウント作成.*/);
      await expect(page.getByText('アカウント作成')).toBeVisible();
    });

    test.describe('入力フォームの検証', () => {
      test.skip('メールアドレスの入力検証', async () => {});
      test.skip('パスワードの入力検証', async () => {});
      test.skip('ログインボタンの有効化/無効化', async () => {});
    });
  });

  test.describe('結合テスト', () => {});
});
