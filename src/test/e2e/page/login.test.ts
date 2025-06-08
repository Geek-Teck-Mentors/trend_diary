import { test, expect } from '@playwright/test';

// ページに対して、単体・結合テストを実施します
// 単体テストでは、ページの表示と基本要素の確認を行います
// 結合テストでは、ログイン機能のフローを確認します
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
  });

  test.describe('結合テスト', () => {});
});
