import { type Page, type Response } from '@playwright/test'
import { AUTH_FLOW_TIMEOUT } from '@/test/e2e/pom/constants'

export type AuthEndpoint = 'signup' | 'login'

export async function waitAuthApiResponse(page: Page, endpoint: AuthEndpoint): Promise<Response> {
  return page.waitForResponse(
    (response) => {
      if (response.request().method() !== 'POST') {
        return false
      }

      return new URL(response.url()).pathname === `/api/v2/auth/${endpoint}`
    },
    { timeout: AUTH_FLOW_TIMEOUT },
  )
}
