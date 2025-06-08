import { test, expect } from '@playwright/test';

test.describe('ログインページの単体テスト', () => {
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
