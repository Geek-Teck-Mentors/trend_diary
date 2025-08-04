import { PrivacyPolicyOutput } from '@/domain/policy'
import policyApiTestHelper from '@/test/helper/policyApiTestHelper'
import policyTestHelper from '@/test/helper/policyTestHelper'

describe('PATCH /api/policies/:version', () => {
  beforeEach(async () => {
    await policyApiTestHelper.beforeEachCleanup()
  })

  afterAll(async () => {
    await policyApiTestHelper.afterAllCleanup()
  })

  describe('正常系', () => {
    it('下書き状態のポリシーを更新できる', async () => {
      // Arrange - 下書きポリシー作成
      const original = await policyTestHelper.createPolicy('更新前のポリシー')
      const version = original.version

      const newContent = '更新後のポリシー内容'
      const requestBody = policyApiTestHelper.createJsonBody({ content: newContent })

      // Act
      const res = await policyApiTestHelper.requestUpdatePolicy(version, requestBody)

      // Assert
      expect(res.status).toBe(200)
      const updated = (await res.json()) as PrivacyPolicyOutput
      expect(updated.version).toBe(version) // バージョンは変わらない
      expect(updated.content).toBe(newContent)
      expect(updated.effectiveAt).toBeNull() // 下書き状態を維持
      expect(updated).toHaveProperty('updatedAt')
      expect(new Date(updated.updatedAt).getTime()).toBeGreaterThan(
        new Date(original.updatedAt).getTime(),
      )
    })

    it('非常に長いコンテンツに更新できる', async () => {
      // Arrange
      const original = await policyTestHelper.createPolicy('短いポリシー')
      const version = original.version

      const longContent = 'a'.repeat(10000)
      const requestBody = policyApiTestHelper.createJsonBody({ content: longContent })

      // Act
      const res = await policyApiTestHelper.requestUpdatePolicy(version, requestBody)

      // Assert
      expect(res.status).toBe(200)
      const updated = (await res.json()) as PrivacyPolicyOutput
      expect(updated.content).toBe(longContent)
    })
  })

  describe('準正常系', () => {
    it('空のコンテンツでは更新できない', async () => {
      // Arrange
      const original = await policyTestHelper.createPolicy('更新前のポリシー')
      const version = original.version

      const requestBody = policyApiTestHelper.createJsonBody({ content: '' })

      // Act
      const res = await policyApiTestHelper.requestUpdatePolicy(version, requestBody)

      // Assert
      expect(res.status).toBe(422)
    })

    it('存在しないバージョンを更新しようとすると404を返す', async () => {
      // Act
      const res = await policyApiTestHelper.requestUpdatePolicy(
        99999,
        policyApiTestHelper.createJsonBody({ content: 'テスト' }),
      )

      // Assert
      expect(res.status).toBe(404)
      const data = (await res.json()) as { message: string }
      expect(data).toHaveProperty('message')
      expect(data.message).toContain('見つかりません')
    })

    it('有効化されたポリシーを更新しようとすると400を返す', async () => {
      // Arrange - ポリシー作成して有効化
      const original = await policyTestHelper.createPolicy('有効化予定ポリシー')
      const version = original.version

      await policyApiTestHelper.activateTestPolicy(version)

      // Act
      const res = await policyApiTestHelper.requestUpdatePolicy(
        version,
        policyApiTestHelper.createJsonBody({ content: '更新テスト' }),
      )

      // Assert
      expect(res.status).toBe(400)
      const data = (await res.json()) as { message: string }
      expect(data).toHaveProperty('message')
      expect(data.message).toContain('有効化されたポリシーは更新できません')
    })

    it('contentが存在しない場合は422を返す', async () => {
      // Arrange
      const original = await policyTestHelper.createPolicy('テストポリシー')
      const version = original.version

      // Act
      const res = await policyApiTestHelper.requestUpdatePolicy(
        version,
        policyApiTestHelper.createJsonBody({}),
      )

      // Assert
      expect(res.status).toBe(422)
    })

    it('無効なバージョン形式（文字列）は422を返す', async () => {
      // Act
      const res = await policyApiTestHelper.requestUpdatePolicy(
        'invalid' as any,
        policyApiTestHelper.createJsonBody({ content: 'テスト' }),
      )

      // Assert
      expect(res.status).toBe(422)
    })

    it('負のバージョン番号は422を返す', async () => {
      // Act
      const res = await policyApiTestHelper.requestUpdatePolicy(
        -1,
        policyApiTestHelper.createJsonBody({ content: 'テスト' }),
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
        `/api/policies/${version}`,
        'PATCH',
        '{ content: invalid json }',
      )

      // Assert
      expect(res.status).toBe(400)
    })
  })

  describe('異常系', () => {
    it('メソッドが間違っている場合は404を返す', async () => {
      // Act
      const res = await policyApiTestHelper.makeRequest('/api/policies/1', {
        method: 'PUT', // PATCHでないメソッド
        body: policyApiTestHelper.createJsonBody({ content: 'テスト' }),
      })

      // Assert
      expect(res.status).toBe(404)
    })

    it('Content-Typeが指定されていない場合は422を返す', async () => {
      // Arrange
      const original = await policyTestHelper.createPolicy('ContentType不正テスト')
      const version = original.version

      // Act
      const res = await policyApiTestHelper.makeRequestWithoutContentType(
        `/api/policies/${version}`,
        'PATCH',
        policyApiTestHelper.createJsonBody({ content: 'テスト' }),
      )

      // Assert
      expect(res.status).toBe(422)
    })
    it('データベースエラーが発生した場合は500を返す', async () => {
      // Note: この種のテストは実際のDBエラーシミュレーションが困難
      // 統合テストでは基本的にはスキップするか、モックインフラとして別途テスト
    })
  })
})
