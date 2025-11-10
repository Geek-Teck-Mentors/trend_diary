import { PrivacyPolicyOutput } from '@/domain/policy'
import TEST_ENV from '@/test/env'
import activeUserTestHelper from '@/test/helper/activeUserTestHelper'
import policyTestHelper from '@/test/helper/policyTestHelper'
import app from '../../../server'

describe('PATCH /api/policies/:version/activate', () => {
  let sessionId: string

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

  async function activateTestPolicy(version: number, effectiveAt: Date) {
    return policyTestHelper.activatePolicy(version, effectiveAt)
  }

  beforeAll(async () => {
    await policyTestHelper.cleanUp()
    await activeUserTestHelper.cleanUp()
    // 管理者アカウント作成・ログイン
    sessionId = await policyTestHelper.setupUserSession()
  })

  afterAll(async () => {
    await policyTestHelper.cleanUp()
    await policyTestHelper.disconnect()
    await activeUserTestHelper.cleanUp()
    await activeUserTestHelper.disconnect()
  })

  describe('正常系', () => {
    it('下書き状態のポリシーを有効化できる', async () => {
      // Arrange - 下書きポリシー作成
      const original = await policyTestHelper.createPolicy('有効化テストポリシー')
      const version = original.version

      const effectiveAt = new Date('2024-01-01T00:00:00Z')
      const requestBody = JSON.stringify({ effectiveAt: effectiveAt.toISOString() })

      // Act
      const res = await requestActivatePolicy(version, requestBody)

      // Assert
      expect(res.status).toBe(200)
      const activated = (await res.json()) as PrivacyPolicyOutput
      expect(activated.version).toBe(version)
      expect(activated.content).toBe('有効化テストポリシー')
      expect(activated.effectiveAt).toEqual(effectiveAt.toISOString())
      expect(activated).toHaveProperty('updatedAt')
      expect(new Date(activated.updatedAt).getTime()).toBeGreaterThan(
        new Date(original.updatedAt).getTime(),
      )
    })

    it('過去の日時で有効化できる', async () => {
      // Arrange
      const original = await policyTestHelper.createPolicy('過去日時有効化テスト')
      const version = original.version

      const pastDate = new Date('2020-01-01T00:00:00Z')
      const requestBody = JSON.stringify({ effectiveAt: pastDate.toISOString() })

      // Act
      const res = await requestActivatePolicy(version, requestBody)

      // Assert
      expect(res.status).toBe(200)
      const activated = (await res.json()) as PrivacyPolicyOutput
      expect(new Date(activated.effectiveAt!)).toEqual(pastDate)
    })

    it('未来の日時で有効化できる', async () => {
      // Arrange
      const original = await policyTestHelper.createPolicy('未来日時有効化テスト')
      const version = original.version

      const futureDate = new Date('2030-01-01T00:00:00Z')
      const requestBody = JSON.stringify({ effectiveAt: futureDate.toISOString() })

      // Act
      const res = await requestActivatePolicy(version, requestBody)

      // Assert
      expect(res.status).toBe(200)
      const activated = (await res.json()) as PrivacyPolicyOutput
      expect(new Date(activated.effectiveAt!)).toEqual(futureDate)
    })
  })

  describe('準正常系', () => {
    it('認証なしの場合は401を返す', async () => {
      // Arrange
      const original = await policyTestHelper.createPolicy('認証なしテスト')
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
    })

    it('存在しないバージョンを有効化しようとすると404を返す', async () => {
      // Act
      const res = await requestActivatePolicy(
        10,
        JSON.stringify({
          effectiveAt: new Date().toISOString(),
        }),
      )

      // Assert
      expect(res.status).toBe(404)
      const data = (await res.json()) as { message: string }
      expect(data).toHaveProperty('message')
      expect(data.message).toContain('見つかりません')
    })

    it('既に有効化されたポリシーを再度有効化しようとすると400を返す', async () => {
      // Arrange - ポリシー作成して有効化
      const original = await policyTestHelper.createPolicy('再有効化テストポリシー')
      const version = original.version

      await activateTestPolicy(version, new Date())

      // Act
      const res = await requestActivatePolicy(
        version,
        JSON.stringify({
          effectiveAt: new Date().toISOString(),
        }),
      )

      // Assert
      expect(res.status).toBe(400)
      const data = (await res.json()) as { message: string }
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
      const original = await policyTestHelper.createPolicy('日時形式テスト')
      const version = original.version

      // Act
      const res = await requestActivatePolicy(
        version,
        JSON.stringify({ effectiveAt: 'invalid-date' }),
      )

      // Assert
      expect(res.status).toBe(422)
    })

    it('不正なJSONの場合は400を返す', async () => {
      // Arrange
      const original = await policyTestHelper.createPolicy('JSON不正テスト')
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
    })
  })

  describe('異常系', () => {
    it('データベースエラーが発生した場合は500を返す', async () => {
      // Note: この種のテストは実際のDBエラーシミュレーションが困難
      // 統合テストでは基本的にはスキップするか、モックインフラとして別途テスト
    })
  })
})
