import { expect, type Locator, type Page } from '@playwright/test'
import { AUTH_FLOW_TIMEOUT } from '@/test/e2e/pom/constants'

export class AuthPage {
  private readonly emailInput: Locator
  private readonly passwordInput: Locator
  private readonly signupButton: Locator
  private readonly loginButton: Locator
  private readonly loginLink: Locator
  private readonly loginPageText: Locator
  private readonly trendsPageText: Locator
  private readonly readStatusFilter: Locator

  constructor(private readonly page: Page) {
    this.emailInput = page.getByLabel('メールアドレス')
    this.passwordInput = page.getByLabel('パスワード')
    this.signupButton = page.getByRole('button', { name: 'アカウント作成' })
    this.loginButton = page.getByRole('button', { name: 'ログイン' })
    this.loginLink = page.getByRole('main').getByRole('link', { name: 'ログイン' })
    this.loginPageText = page.getByText('アカウントをお持ちでないですか？')
    this.trendsPageText = page.getByText('絞り込み')
    this.readStatusFilter = page.getByRole('button', { name: '未読のみ' })
  }

  async gotoSignup(): Promise<void> {
    await this.page.goto('/signup')
  }

  async signupAndMoveToLogin(email: string, password: string): Promise<void> {
    if (new URL(this.page.url()).pathname !== '/login') {
      await this.emailInput.fill(email)
      await this.passwordInput.fill(password)
      await this.signupButton.click()
      await this.page.waitForURL(/\/login(?:\?.*)?$/, { timeout: 5000 }).catch(() => undefined)

      if (new URL(this.page.url()).pathname === '/signup') {
        await this.loginLink.click()
      }
    }

    await expect(this.page).toHaveURL(/\/login(?:\?.*)?$/, { timeout: AUTH_FLOW_TIMEOUT })
    await expect(this.loginPageText).toBeVisible({ timeout: 5000 })
  }

  async loginAndMoveToTrends(email: string, password: string): Promise<void> {
    if (new URL(this.page.url()).pathname !== '/trends') {
      await this.emailInput.fill(email)
      await this.passwordInput.fill(password)
      await this.loginButton.click()
    }

    await expect(this.page).toHaveURL(/\/trends(?:\?.*)?$/, { timeout: AUTH_FLOW_TIMEOUT })
    await expect(this.trendsPageText).toBeVisible({ timeout: 5000 })
    await expect(this.readStatusFilter).toBeVisible({ timeout: 5000 })
  }
}
