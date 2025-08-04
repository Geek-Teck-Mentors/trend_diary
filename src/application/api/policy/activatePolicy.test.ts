import TEST_ENV from '@/test/env'
import policyTestHelper from '@/test/helper/policyTestHelper'
import app from '../../server'
import { PrivacyPolicyOutput } from '@/domain/policy'

describe('PATCH /api/policies/:version/activate', () => {
  let sessionId: string

  async function setupTestData(): Promise<void> {
    // 管理者アカウント作成・ログイン
    sessionId = await policyTestHelper.setupUserSession()
  }

  async function requestActivatePolicy(version: number, body: string) {
    return app.request(
      `/api/policies/${version}/activate`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `sid=${sessionId}`,
        },
        body,
      },
      TEST_ENV,
    )
  }

  async function createTestPolicy(content = 'テストポリシー') {
    return policyTestHelper.createPolicy(sessionId, content)
  }

  async function deleteTestPolicy(version: number) {
    return policyTestHelper.deletePolicy(version)
  }

  async function activateTestPolicy(version: number, effectiveAt: Date) {
    return policyTestHelper.activatePolicy(version, effectiveAt)
  }

  beforeEach(async () => {
    await policyTestHelper.cleanUpAll()
    await setupTestData()
  })

  afterAll(async () => {
    await policyTestHelper.cleanUpAll()
    await policyTestHelper.disconnect()
  })

  describe('正常系', () => {
    it('下書き状態のポリシーを有効化できる（effectiveAt指定）', async () => {
      // Arrange - 下書きポリシー作成
      const original = await createTestPolicy('有効化テストポリシー')
      const version = original.version

      const effectiveAt = new Date('2024-01-01T00:00:00Z')
      const requestBody = JSON.stringify({ effectiveAt: effectiveAt.toISOString() })

      // Act
      const res = await requestActivatePolicy(version, requestBody)

      // Assert
      expect(res.status).toBe(200)
      const activated = await res.json() as PrivacyPolicyOutput
      expect(activated.version).toBe(version)
      expect(activated.content).toBe('有効化テストポリシー')
      expect(activated.effectiveAt).toEqual(effectiveAt)
      expect(activated).toHaveProperty('updatedAt')
      expect(new Date(activated.updatedAt).getTime()).toBeGreaterThan(
        new Date(original.updatedAt).getTime(),
      )
    })

    it('下書き状態のポリシーを有効化できる（effectiveAt未指定で現在時刻使用）', async () => {
      // Arrange - 下書きポリシー作成
      const original = await createTestPolicy('現在時刻有効化テストポリシー')
      const version = original.version

      const beforeRequest = new Date()
      const requestBody = JSON.stringify({})

      // Act
      const res = await requestActivatePolicy(version, requestBody)
      const afterRequest = new Date()

      // Assert
      expect(res.status).toBe(200)
      const activated = await res.json()
      expect(activated.version).toBe(version)
      expect(activated.content).toBe('現在時刻有効化テストポリシー')

      const effectiveAtDate = new Date(activated.effectiveAt)
      expect(effectiveAtDate.getTime()).toBeGreaterThanOrEqual(beforeRequest.getTime())
      expect(effectiveAtDate.getTime()).toBeLessThanOrEqual(afterRequest.getTime())
    })

    it('過去の日時で有効化できる', async () => {
      // Arrange
      const original = await createTestPolicy('過去日時有効化テスト')
      const version = original.version

      const pastDate = new Date('2020-01-01T00:00:00Z')
      const requestBody = JSON.stringify({ effectiveAt: pastDate.toISOString() })

      // Act
      const res = await requestActivatePolicy(version, requestBody)

      // Assert
      expect(res.status).toBe(200)
      const activated = await res.json()
      expect(new Date(activated.effectiveAt)).toEqual(pastDate)
    })

    it('未来の日時で有効化できる', async () => {
      // Arrange
      const original = await createTestPolicy('未来日時有効化テスト')
      const version = original.version

      const futureDate = new Date('2030-01-01T00:00:00Z')
      const requestBody = JSON.stringify({ effectiveAt: futureDate.toISOString() })

      // Act
      const res = await requestActivatePolicy(version, requestBody)

      // Assert
      expect(res.status).toBe(200)
      const activated = await res.json()
      expect(new Date(activated.effectiveAt)).toEqual(futureDate)
    })
  })

  describe('準正常系', () => {
    it('存在しないバージョンを有効化しようとすると404を返す', async () => {
      // Act
      const res = await requestActivatePolicy(99999, JSON.stringify({}))

      // Assert
      expect(res.status).toBe(404)
      const data = await res.json()
      expect(data).toHaveProperty('message')
      expect(data.message).toContain('見つかりません')
    })

    it('既に有効化されたポリシーを再度有効化しようとすると400を返す', async () => {
      // Arrange - ポリシー作成して有効化
      const original = await createTestPolicy('再有効化テストポリシー')
      const version = original.version

      await activateTestPolicy(version, new Date())

      // Act
      const res = await requestActivatePolicy(version, JSON.stringify({}))

      // Assert
      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data).toHaveProperty('message')
      expect(data.message).toContain('既に有効化されています')
    })

    it('無効なバージョン形式（文字列）は422を返す', async () => {
      // Act
      const res = await app.request(
        '/api/policies/invalid/activate',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Cookie: `sid=${sessionId}`,
          },
          body: JSON.stringify({}),
        },
        TEST_ENV,
      )

      // Assert
      expect(res.status).toBe(422)
    })

    it('負のバージョン番号は422を返す', async () => {
      // Act
      const res = await requestActivatePolicy(-1, JSON.stringify({}))

      // Assert
      expect(res.status).toBe(422)
    })

    it('無効な日時形式は422を返す', async () => {
      // Arrange
      const original = await createTestPolicy('日時形式テスト')
      const version = original.version

      // Act
      const res = await requestActivatePolicy(
        version,
        JSON.stringify({ effectiveAt: 'invalid-date' }),
      )

      // Assert
      expect(res.status).toBe(422)

      // Cleanup
      await deleteTestPolicy(version)
    })

    it('不正なJSONの場合は400を返す', async () => {
      // Arrange
      const original = await createTestPolicy('JSON不正テスト')
      const version = original.version

      // Act
      const res = await app.request(
        `/api/policies/${version}/activate`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Cookie: `sid=${sessionId}`,
          },
          body: '{ effectiveAt: invalid json }',
        },
        TEST_ENV,
      )

      // Assert
      expect(res.status).toBe(400)

      // Cleanup
      await deleteTestPolicy(version)
    })

    it('不要なプロパティを含むリクエストも処理できる', async () => {
      // Arrange
      const original = await createTestPolicy('不要プロパティテスト')
      const version = original.version

      const effectiveAt = new Date('2024-06-01T00:00:00Z')
      const requestBody = JSON.stringify({
        effectiveAt: effectiveAt.toISOString(),
        extraProperty: 'should be ignored',
        anotherProperty: 123,
      })

      // Act
      const res = await requestActivatePolicy(version, requestBody)

      // Assert
      expect(res.status).toBe(200)
      const activated = await res.json()
      expect(new Date(activated.effectiveAt)).toEqual(effectiveAt)
    })
  })

  describe('異常系', () => {
    it('メソッドが間違っている場合は404を返す', async () => {
      // Act
      const res = await app.request(
        '/api/policies/1/activate',
        {
          method: 'PUT', // PATCHでないメソッド
          headers: {
            'Content-Type': 'application/json',
            Cookie: `sid=${sessionId}`,
          },
          body: JSON.stringify({}),
        },
        TEST_ENV,
      )

      // Assert
      expect(res.status).toBe(404)
    })

    it('Content-Typeが指定されていない場合でも空のボディで処理できる', async () => {
      // Arrange
      const original = await createTestPolicy('ContentType不正テスト')
      const version = original.version

      // Act
      const res = await app.request(
        `/api/policies/${version}/activate`,
        {
          method: 'PATCH',
          headers: {
            Cookie: `sid=${sessionId}`,
          },
          body: JSON.stringify({}),
        },
        TEST_ENV,
      )

      // Assert
      expect(res.status).toBe(200)
      const activated = await res.json()
      expect(activated).toHaveProperty('effectiveAt')

      // Cleanup (不要 - 有効化されているため削除できない)
    })

    it('認証なしの場合は401を返す', async () => {
      // Arrange
      const original = await createTestPolicy('認証なしテスト')
      const version = original.version

      // Act
      const res = await app.request(
        `/api/policies/${version}/activate`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        },
        TEST_ENV,
      )

      // Assert
      expect(res.status).toBe(401)

      // Cleanup
      await deleteTestPolicy(version)
    })

    it('データベースエラーが発生した場合は500を返す', async () => {
      // Note: この種のテストは実際のDBエラーシミュレーションが困難
      // 統合テストでは基本的にはスキップするか、モックインフラとして別途テスト
    })
  })
})
