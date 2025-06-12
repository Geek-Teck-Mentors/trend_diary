import { test, expect } from '@playwright/test';

// ページに対して、単体・結合テストを実施します
// 単体テストでは、API関連のページの表示と基本要素を確認します
// 結合テストでは、画面遷移に伴うAPIを含む挙動を確認します
test.describe('ログインページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test.describe('単体テスト', () => {
    test('表示と基本要素の確認', async ({ page }) => {
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

    test.describe('入力フォームの検証', () => {
      test('メールアドレスの入力検証', async ({ page }) => {
        const emailInput = page.getByLabel('メールアドレス');
        const passwordInput = page.getByLabel('パスワード');
        const loginButton = page.getByRole('button', { name: 'ログイン' });

        // テストケースのテーブル定義
        const testCases = [
          {
            description: '空文字',
            email: '',
            shouldShowError: true,
          },
          {
            description: '@マークなし',
            email: 'invalid-email',
            shouldShowError: true,
          },
          {
            description: 'ローカル部なし',
            email: '@example.com',
            shouldShowError: true,
          },
          {
            description: 'ドメインなし',
            email: 'test@',
            shouldShowError: true,
          },
          {
            description: 'スペースあり',
            email: 'test @example.com',
            shouldShowError: true,
          },
          {
            description: '連続ドット',
            email: 'test..test@example.com',
            shouldShowError: true,
          },
          {
            description: '有効な標準形式',
            email: 'test@example.com',
            shouldShowError: false,
          },
          {
            description: 'サブドメインあり',
            email: 'user@mail.example.com',
            shouldShowError: false,
          },
          {
            description: 'プラス記号付き',
            email: 'user+test@example.co.jp',
            shouldShowError: false,
          },
          {
            description: '数字とハイフン',
            email: 'test-123@example-site.co.jp',
            shouldShowError: false,
          },
        ];

        // 各テストケースを順次実行
        await testCases.reduce(async (previousPromise, testCase) => {
          await previousPromise;
          
          await emailInput.fill(testCase.email);
          await passwordInput.fill('password123');
          await loginButton.click();
          await page.waitForTimeout(500);

          if (testCase.shouldShowError) {
            await expect(page.getByText('Invalid email')).toBeVisible({
              timeout: 3000,
            });
          } else {
            await expect(page.getByText('Invalid email')).not.toBeVisible({
              timeout: 3000,
            });
          }

          // フォームをクリアして次のテストケースの準備
          await emailInput.clear();
        }, Promise.resolve());
      });
      test.skip('パスワードの入力検証', async () => {});
      test.skip('ログインボタンの有効化/無効化', async () => {});
    });
  });

  test.describe('結合テスト', () => {
    test('アカウント作成ページへの遷移', async ({ page }) => {
      // アカウント作成リンクをクリック
      await page.getByText('アカウント作成').click();

      // アカウント作成ページのタイトルを確認
      await expect(page).toHaveTitle(/.*アカウント作成.*/);
      await expect(page.getByText('アカウント作成')).toBeVisible();
    });

    test('ログイン成功時の挙動', () => {});
    test('ログイン失敗時の挙動', () => {});
  });
});
