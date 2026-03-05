import { expect, type Locator, type Page } from '@playwright/test'
import { type AuthEndpoint, waitAuthApiResponse } from '@/test/e2e/helper/auth-api'
import { AUTH_FLOW_TIMEOUT } from '@/test/e2e/pom/constants'

type SubmitButtonName = 'アカウント作成' | 'ログイン'

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
    this.loginLink = page.getByRole('link', { name: 'ログイン' })
    this.loginPageText = page.getByText('アカウントをお持ちでないですか？')
    this.trendsPageText = page.getByText('絞り込み')
    this.readStatusFilter = page.getByRole('button', { name: '未読のみ' })
  }

  async gotoSignup(): Promise<void> {
    await this.page.goto('/signup')
  }

  async signupAndMoveToLogin(email: string, password: string): Promise<void> {
    await expect(async () => {
      if (new URL(this.page.url()).pathname === '/login') {
        await expect(this.loginPageText).toBeVisible({ timeout: 2000 })
        return
      }

      await this.emailInput.fill(email)
      await this.passwordInput.fill(password)
      const signupStatus = await this.submitAuthForm('アカウント作成', 'signup')

      if (signupStatus === 409 && new URL(this.page.url()).pathname === '/signup') {
        await this.loginLink.click()
      }

      await expect(this.page).toHaveURL(/\/login(?:\?.*)?$/, { timeout: 5000 })
      await expect(this.loginPageText).toBeVisible({ timeout: 5000 })
    }).toPass({ timeout: AUTH_FLOW_TIMEOUT })
  }

  async loginAndMoveToTrends(email: string, password: string): Promise<void> {
    await expect(async () => {
      if (new URL(this.page.url()).pathname === '/trends') {
        await expect(this.trendsPageText).toBeVisible({ timeout: 2000 })
        await expect(this.readStatusFilter).toBeVisible({ timeout: 2000 })
        return
      }

      await this.emailInput.fill(email)
      await this.passwordInput.fill(password)
      const loginStatus = await this.submitAuthForm('ログイン', 'login')
      expect(loginStatus).toBe(200)

      await expect(this.page).toHaveURL(/\/trends(?:\?.*)?$/, { timeout: 5000 })
      await expect(this.trendsPageText).toBeVisible({ timeout: 5000 })
      await expect(this.readStatusFilter).toBeVisible({ timeout: 5000 })
    }).toPass({ timeout: AUTH_FLOW_TIMEOUT })
  }

  private async submitAuthForm(
    submitButtonName: SubmitButtonName,
    endpoint: AuthEndpoint,
  ): Promise<number> {
    const responsePromise = waitAuthApiResponse(this.page, endpoint)
    await this.submitButton(submitButtonName).click()
    const response = await responsePromise

    if (endpoint === 'signup') {
      expect([201, 409]).toContain(response.status())
      return response.status()
    }

    expect(response.ok()).toBeTruthy()
    return response.status()
  }

  private submitButton(submitButtonName: SubmitButtonName): Locator {
    if (submitButtonName === 'アカウント作成') return this.signupButton
    return this.loginButton
  }
}
