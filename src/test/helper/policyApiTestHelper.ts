import app from '@/application/server'
import TEST_ENV from '@/test/env'
import activeUserTestHelper from './activeUserTestHelper'
import policyTestHelper from './policyTestHelper'

export interface ApiRequestOptions {
  method: string
  headers?: Record<string, string>
  body?: string
}

class PolicyApiTestHelper {
  private sessionId?: string

  async setupSession(): Promise<string> {
    if (!this.sessionId) {
      this.sessionId = await policyTestHelper.setupUserSession()
    }
    return this.sessionId
  }

  async makeRequest(url: string, options: ApiRequestOptions): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.sessionId) {
      headers.Cookie = `sid=${this.sessionId}`
    }

    return app.request(
      url,
      {
        method: options.method,
        headers,
        body: options.body,
      },
      TEST_ENV,
    )
  }

  async requestCreatePolicy(body: string): Promise<Response> {
    return this.makeRequest('/api/policies', {
      method: 'POST',
      body,
    })
  }

  async requestUpdatePolicy(version: number, body: string): Promise<Response> {
    return this.makeRequest(`/api/policies/${version}`, {
      method: 'PATCH',
      body,
    })
  }

  async requestGetPolicies(query: string = ''): Promise<Response> {
    const url = query ? `/api/policies?${query}` : '/api/policies'
    return this.makeRequest(url, {
      method: 'GET',
    })
  }

  async requestGetPolicyByVersion(version: number): Promise<Response> {
    return this.makeRequest(`/api/policies/${version}`, {
      method: 'GET',
    })
  }

  async requestDeletePolicy(version: number): Promise<Response> {
    return this.makeRequest(`/api/policies/${version}`, {
      method: 'DELETE',
    })
  }

  async requestActivatePolicy(version: number, body: string): Promise<Response> {
    return this.makeRequest(`/api/policies/${version}/activate`, {
      method: 'PATCH',
      body,
    })
  }

  async requestClonePolicy(version: number, body = '{}'): Promise<Response> {
    return this.makeRequest(`/api/policies/${version}/clone`, {
      method: 'POST',
      body,
    })
  }

  async makeUnauthenticatedRequest(url: string, options: ApiRequestOptions): Promise<Response> {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    return app.request(
      url,
      {
        method: options.method,
        headers,
        body: options.body,
      },
      TEST_ENV,
    )
  }

  async makeInvalidJsonRequest(
    url: string,
    method: string,
    invalidBody: string,
  ): Promise<Response> {
    return app.request(
      url,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          Cookie: `sid=${this.sessionId}`,
        },
        body: invalidBody,
      },
      TEST_ENV,
    )
  }

  async makeRequestWithoutContentType(
    url: string,
    method: string,
    body: string,
  ): Promise<Response> {
    return app.request(
      url,
      {
        method,
        headers: {
          Cookie: `sid=${this.sessionId}`,
        },
        body,
      },
      TEST_ENV,
    )
  }

  async activateTestPolicy(version: number): Promise<any> {
    return policyTestHelper.activatePolicy(version, new Date())
  }

  async setupTestData(): Promise<void> {
    await this.setupSession()
  }

  async beforeEachCleanup(): Promise<void> {
    await policyTestHelper.cleanUp()
    await this.setupTestData()
  }

  async beforeAllSetup(): Promise<void> {
    await policyTestHelper.cleanUp()
    await activeUserTestHelper.cleanUp()
    await this.setupTestData()
  }

  async afterAllCleanup(): Promise<void> {
    await policyTestHelper.cleanUp()
    await activeUserTestHelper.cleanUp()
    await policyTestHelper.disconnect()
    await activeUserTestHelper.disconnect()
  }

  createJsonBody(data: Record<string, any>): string {
    return JSON.stringify(data)
  }

  async testCommonValidations(
    requestFn: (version: number | string) => Promise<Response>,
    validVersionForPrep?: () => Promise<number>,
  ): Promise<void> {
    describe('共通バリデーション', () => {
      it('無効なバージョン形式（文字列）は422を返す', async () => {
        const res = await requestFn('invalid')
        expect(res.status).toBe(422)
      })

      it('負のバージョン番号は422を返す', async () => {
        const res = await requestFn(-1)
        expect(res.status).toBe(422)
      })

      it('version=0は422を返す', async () => {
        const res = await requestFn(0)
        expect(res.status).toBe(422)
      })
    })
  }

  async testNotFoundError(requestFn: (version: number) => Promise<Response>): Promise<void> {
    it('存在しないバージョンを指定すると404を返す', async () => {
      const res = await requestFn(99999)
      expect(res.status).toBe(404)
      const data = (await res.json()) as { message: string }
      expect(data).toHaveProperty('message')
      expect(data.message).toContain('見つかりません')
    })
  }

  async testUnauthenticatedAccess(url: string, method: string, body?: string): Promise<void> {
    it('認証なしの場合は401を返す', async () => {
      const res = await this.makeUnauthenticatedRequest(url, {
        method,
        body,
      })
      expect(res.status).toBe(401)
    })
  }
}

const policyApiTestHelper = new PolicyApiTestHelper()
export default policyApiTestHelper
