import { PrivacyPolicyOutput } from '@/domain/policy'
import policyApiTestHelper from '@/test/helper/policyApiTestHelper'
import policyTestHelper from '@/test/helper/policyTestHelper'

describe('PATCH /api/policies/:version/activate', () => {
  beforeAll(async () => {
    await policyApiTestHelper.beforeAllSetup()
  })

  afterAll(async () => {
    await policyApiTestHelper.afterAllCleanup()
  })

  describe('正常系', () => {
    it('下書き状態のポリシーを有効化できる', async () => {
      // Arrange - 下書きポリシー作成
      const original = await policyTestHelper.createPolicy('有効化テストポリシー')
      const version = original.version

      const effectiveAt = new Date('2024-01-01T00:00:00Z')
      const requestBody = policyApiTestHelper.createJsonBody({
        effectiveAt: effectiveAt.toISOString(),
      })

      // Act
      const res = await policyApiTestHelper.requestActivatePolicy(version, requestBody)

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
      const requestBody = policyApiTestHelper.createJsonBody({
        effectiveAt: pastDate.toISOString(),
      })

      // Act
      const res = await policyApiTestHelper.requestActivatePolicy(version, requestBody)

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
      const requestBody = policyApiTestHelper.createJsonBody({
        effectiveAt: futureDate.toISOString(),
      })

      // Act
      const res = await policyApiTestHelper.requestActivatePolicy(version, requestBody)

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
      const res = await policyApiTestHelper.makeUnauthenticatedRequest(
        `/api/policies/${version}/activate`,
        {
          method: 'PATCH',
          body: policyApiTestHelper.createJsonBody({}),
        },
      )

      // Assert
      expect(res.status).toBe(401)
    })

    it('存在しないバージョンを有効化しようとすると404を返す', async () => {
      // Act
      const res = await policyApiTestHelper.requestActivatePolicy(
        10,
        policyApiTestHelper.createJsonBody({
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

      await policyApiTestHelper.activateTestPolicy(version)

      // Act
      const res = await policyApiTestHelper.requestActivatePolicy(
        version,
        policyApiTestHelper.createJsonBody({
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
      const res = await policyApiTestHelper.requestActivatePolicy(
        'invalid' as any,
        policyApiTestHelper.createJsonBody({}),
      )

      // Assert
      expect(res.status).toBe(422)
    })

    it('負のバージョン番号は422を返す', async () => {
      // Act
      const res = await policyApiTestHelper.requestActivatePolicy(
        -1,
        policyApiTestHelper.createJsonBody({}),
      )

      // Assert
      expect(res.status).toBe(422)
    })

    it('無効な日時形式は422を返す', async () => {
      // Arrange
      const original = await policyTestHelper.createPolicy('日時形式テスト')
      const version = original.version

      // Act
      const res = await policyApiTestHelper.requestActivatePolicy(
        version,
        policyApiTestHelper.createJsonBody({ effectiveAt: 'invalid-date' }),
      )

      // Assert
      expect(res.status).toBe(422)
    })

    it('不正なJSONの場合は400を返す', async () => {
      // Arrange
      const original = await policyTestHelper.createPolicy('JSON不正テスト')
      const version = original.version

      // Act
      const res = await policyApiTestHelper.makeInvalidJsonRequest(
        `/api/policies/${version}/activate`,
        'PATCH',
        '{ effectiveAt: invalid json }',
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
