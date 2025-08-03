import { expect, test } from '@playwright/test'
import activeUserTestHelper from '@/test/helper/activeUserTestHelper'

test.describe('ログインページ', () => {
  test.describe.configure({ mode: 'default' })
  // テストアカウントの情報
  const testEmail = 'test@example.com'
  const testPassword = 'password123'

  test.beforeAll(async () => {
    await activeUserTestHelper.cleanUp()
    await activeUserTestHelper.create(testEmail, testPassword)
  })

  test.afterAll(async () => {
    await activeUserTestHelper.cleanUp()
    await activeUserTestHelper.disconnect()
  })

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('アカウント作成ページへの遷移', async ({ page }) => {
    // ログインフォーム内のアカウント作成リンクをクリック
    await page.getByRole('link', { name: 'アカウント作成' }).nth(1).click()

    // アカウント作成ページのタイトルを確認
    await expect(page).toHaveTitle(/.*アカウント作成.*/)
    await expect(page.getByText('以下の情報を入力してアカウントを作成してください')).toBeVisible()
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
    await expect(page.getByText('メールアドレスまたはパスワードが正しくありません')).toBeVisible()

    // ログインページに留まることを確認
    await expect(page).toHaveURL('/login')
    await expect(page.getByText('ログイン').first()).toBeVisible()
  })
})
