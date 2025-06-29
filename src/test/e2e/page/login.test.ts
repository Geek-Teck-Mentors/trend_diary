import { expect, test } from '@playwright/test'
import accountTestHelper from '@/test/helper/accountTestHelper'
import { runTestCasesSequentially } from '@/test/helper/sequential'

// ページに対して、単体・結合テストを実施します
// 単体テストでは、API関連のページの表示と基本要素を確認します
// 結合テストでは、画面遷移に伴うAPIを含む挙動を確認します
test.describe('ログインページ', () => {
  test.describe.configure({ mode: 'default' })
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test.describe('単体テスト', () => {
    test('表示と基本要素の確認', async ({ page }) => {
      // ページタイトルを確認
      await expect(page).toHaveTitle(/.*ログイン.*/)

      // 基本要素の存在確認
      await expect(page.getByText('ログイン').first()).toBeVisible()
      await expect(page.getByText('メールアドレス')).toBeVisible()
      await expect(page.getByText('パスワード')).toBeVisible()
      await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible()
      await expect(page.getByText('アカウントをお持ちでないですか？')).toBeVisible()
      await expect(page.getByText('アカウント作成')).toBeVisible()
    })

    test.describe('入力フォームの検証', () => {
      test('メールアドレスの入力検証', async ({ page }) => {
        const emailInput = page.getByLabel('メールアドレス')
        const passwordInput = page.getByLabel('パスワード')
        const loginButton = page.getByRole('button', { name: 'ログイン' })

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
            email: 'dummy-test@example.com',
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
        ]

        // 各テストケースを順次実行
        await runTestCasesSequentially(testCases, async (testCase) => {
          await emailInput.fill(testCase.email)
          await passwordInput.fill('password123')
          await loginButton.click()

          if (testCase.shouldShowError) {
            await expect(page.getByText('Invalid email')).toBeVisible({
              timeout: 3000,
            })
          } else {
            // ログインボタンが再度押せる状態になることを待機
            await expect(loginButton).toBeEnabled({ timeout: 3000 })
            await expect(page.getByText('Invalid email')).not.toBeVisible({
              timeout: 3000,
            })
          }

          // フォームをクリアして次のテストケースの準備
          await emailInput.clear()
        })
      })

      test('パスワードの入力検証', async ({ page }) => {
        const emailInput = page.getByLabel('メールアドレス')
        const passwordInput = page.getByLabel('パスワード')
        const loginButton = page.getByRole('button', { name: 'ログイン' })

        // テストケースのテーブル定義
        const testCases = [
          {
            description: '空文字',
            password: '',
            shouldShowError: true,
          },
          {
            description: '7文字以下',
            password: 'short',
            shouldShowError: true,
          },
          {
            description: '1文字',
            password: 'a',
            shouldShowError: true,
          },
          {
            description: '51文字以上',
            password: 'a'.repeat(51),
            shouldShowError: true,
          },
          {
            description: '8文字（有効な最小）',
            password: 'password',
            shouldShowError: false,
          },
          {
            description: '50文字（有効な最大）',
            password: 'a'.repeat(50),
            shouldShowError: false,
          },
          {
            description: '英数字記号混合',
            password: 'Password123!',
            shouldShowError: false,
          },
          {
            description: '日本語を含む',
            password: 'パスワード123',
            shouldShowError: false,
          },
        ]

        // 各テストケースを順次実行
        await runTestCasesSequentially(testCases, async (testCase) => {
          await emailInput.fill('test@example.com') // 有効なメールアドレス
          await passwordInput.fill(testCase.password)
          await loginButton.click()

          if (testCase.shouldShowError) {
            // Zodのパスワードバリデーションエラーが表示されることを確認
            await expect(page.getByText(/Required|at least|at most/i)).toBeVisible({
              timeout: 3000,
            })
          } else {
            // ログインボタンが再度押せる状態になることを待機
            await expect(loginButton).toBeEnabled({ timeout: 3000 })
            // パスワードバリデーションエラーは表示されない（認証エラーは別）
            await expect(page.getByText(/Required|at least|at most/i)).not.toBeVisible({
              timeout: 3000,
            })
          }

          // フォームをクリアして次のテストケースの準備
          await emailInput.clear()
          await passwordInput.clear()
        })
      })
    })
  })

  test.describe('結合テスト', () => {
    test.describe.configure({ mode: 'default' })
    // テストアカウントの情報
    const testEmail = 'test@example.com'
    const testPassword = 'password123'

    test.beforeAll(async () => {
      await accountTestHelper.cleanUp()
      await accountTestHelper.createTestAccount(testEmail, testPassword)
    })

    test.afterAll(async () => {
      await accountTestHelper.cleanUp()
      await accountTestHelper.disconnect()
    })

    test.beforeEach(async ({ page }) => {
      await page.goto('/login')
    })

    test('アカウント作成ページへの遷移', async ({ page }) => {
      // アカウント作成リンクをクリック
      await page.getByText('アカウント作成').click()

      // アカウント作成ページのタイトルを確認
      await expect(page).toHaveTitle(/.*アカウント作成.*/)
      await expect(page.getByText('アカウント作成')).toBeVisible()
    })

    test('ログイン成功時の挙動', async ({ page }) => {
      // フォームに入力
      await page.getByLabel('メールアドレス').fill(testEmail)
      await page.getByLabel('パスワード').fill(testPassword)

      // ログインボタンをクリック
      await page.getByRole('button', { name: 'ログイン' }).click()

      // ページ遷移を待機
      await page.waitForURL('/trends', { timeout: 10000 })
    })

    test('ログイン失敗時の挙動', async ({ page }) => {
      // 無効な認証情報でテスト
      const invalidEmail = 'invalid@example.com'
      const invalidPassword = 'wrongpassword'

      // フォームに入力
      await page.getByLabel('メールアドレス').fill(invalidEmail)
      await page.getByLabel('パスワード').fill(invalidPassword)

      // ログインボタンをクリック
      await page.getByRole('button', { name: 'ログイン' }).click()

      // エラーメッセージが表示されることを確認
      await expect(
        page.getByText('メールアドレスまたはパスワードが正しくありません。'),
      ).toBeVisible()

      // ログインページに留まることを確認
      await expect(page).toHaveURL('/login')
      await expect(page.getByText('ログイン').first()).toBeVisible()
    })
  })
})
