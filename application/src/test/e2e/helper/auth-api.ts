import { type Page, type Response } from '@playwright/test'

export type AuthEndpoint = 'signup' | 'login'

export async function waitAuthApiResponse(page: Page, endpoint: AuthEndpoint): Promise<Response> {
  return page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' && response.url().includes(`/api/v2/auth/${endpoint}`),
    { timeout: 5000 },
  )
}
