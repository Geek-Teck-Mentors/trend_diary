import { expect, test } from '@playwright/test'
import accountTestHelper from '@/test/helper/accountTestHelper'

test.describe('ログインページ', () => {
  test.describe.configure({ mode: 'default' })
  // テストアカウントの情報
  const testEmail = 'test@example.com'
  const testPassword = 'password123'

  test.beforeAll(async () => {
    await accountTestHelper.cleanUp()
    await accountTestHelper.create(testEmail, testPassword)
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
    await expect(page.getByText('メールアドレスまたはパスワードが正しくありません。')).toBeVisible()

    // ログインページに留まることを確認
    await expect(page).toHaveURL('/login')
    await expect(page.getByText('ログイン').first()).toBeVisible()
  })
})
