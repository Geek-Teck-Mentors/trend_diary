import { expect, type Page } from '@playwright/test'

export type AuthEndpoint = 'signup' | 'login'

export async function waitAuthApiSuccess(page: Page, endpoint: AuthEndpoint): Promise<void> {
  const response = await page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' && response.url().includes(`/api/v2/auth/${endpoint}`),
    { timeout: 5000 },
  )

  expect(response.ok()).toBeTruthy()
}
