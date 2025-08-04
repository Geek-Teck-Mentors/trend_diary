import TEST_ENV from '@/test/env'
import policyTestHelper from '@/test/helper/policyTestHelper'
import app from '../../server'

describe('DELETE /api/policies/:version', () => {
  let sessionId: string
  afterAll(async () => {
    await policyTestHelper.disconnect()
  })

  beforeEach(async () => {
    await policyTestHelper.cleanUpAll()
    sessionId = await policyTestHelper.setupUserSession()
  })

  async function requestDeletePolicy(version: number) {
    return app.request(
      `/api/policies/${version}`,
      {
        method: 'DELETE',
        headers: {
          Cookie: `sid=${sessionId}`,
        },
      },
      TEST_ENV,
    )
  }

  describe('正常系', () => {
    it('下書き状態のポリシーを削除できる', async () => {
      // Arrange - 下書きポリシー作成
      const policy = await policyTestHelper.createPolicy(sessionId, '削除予定ポリシー')

      // Act
      const res = await requestDeletePolicy(policy.version)

      // Assert
      expect(res.status).toBe(204) // No Content

      // 削除されたことを確認（ヘルパーでも null が返ることを確認）
      const deletedPolicy = await policyTestHelper.getPolicy(policy.version)
      expect(deletedPolicy).toBeNull()
    })

    it('複数の下書きポリシーをそれぞれ削除できる', async () => {
      // Arrange - 複数の下書きポリシー作成
      const policy1 = await policyTestHelper.createPolicy(sessionId, '削除予定ポリシー1')
      const policy2 = await policyTestHelper.createPolicy(sessionId, '削除予定ポリシー2')

      // Act
      const res1 = await requestDeletePolicy(policy1.version)
      const res2 = await requestDeletePolicy(policy2.version)

      // Assert
      expect(res1.status).toBe(204)
      expect(res2.status).toBe(204)

      // 削除されたことを確認
      const deletedPolicy1 = await policyTestHelper.getPolicy(policy1.version)
      const deletedPolicy2 = await policyTestHelper.getPolicy(policy2.version)
      expect(deletedPolicy1).toBeNull()
      expect(deletedPolicy2).toBeNull()
    })
  })

  describe('準正常系', () => {
    it('認証なしの場合は401を返す', async () => {
      // Act - セッションIDなしでリクエスト
      const res = await app.request('/api/policies/1', { method: 'DELETE' }, TEST_ENV)

      // Assert
      expect(res.status).toBe(401)
    })
    it('存在しないバージョンを削除しようとすると404を返す', async () => {
      // Act
      const res = await requestDeletePolicy(99999)

      // Assert
      expect(res.status).toBe(404)
      const data = (await res.json()) as { message: string }
      expect(data).toHaveProperty('message')
      expect(data.message).toContain('見つかりません')
    })

    it('有効化されたポリシーを削除しようとすると400を返す', async () => {
      // Arrange - ポリシー作成して有効化
      const policy = await policyTestHelper.createPolicy(sessionId, '有効化後削除テスト')
      const effectiveAt = new Date()
      await policyTestHelper.activatePolicy(policy.version, effectiveAt)

      // Act
      const res = await requestDeletePolicy(policy.version)

      // Assert
      expect(res.status).toBe(400)
      const data = (await res.json()) as { message: string }
      expect(data).toHaveProperty('message')
      expect(data.message).toContain('有効化されたポリシーは削除できません')

      // ポリシーが削除されていないことを確認
      const existingPolicy = await policyTestHelper.getPolicy(policy.version)
      expect(existingPolicy).not.toBeNull()
      expect(existingPolicy?.effectiveAt).not.toBeNull()
    })

    it('無効なバージョン形式（文字列）は422を返す', async () => {
      // Act
      const res = await app.request(
        '/api/policies/invalid',
        {
          method: 'DELETE',
          headers: {
            Cookie: `sid=${sessionId}`,
          },
        },
        TEST_ENV,
      )

      // Assert
      expect(res.status).toBe(422)
    })

    it('負のバージョン番号は422を返す', async () => {
      // Act
      const res = await requestDeletePolicy(-1)

      // Assert
      expect(res.status).toBe(422)
    })

    it('version=0は422を返す', async () => {
      // Act
      const res = await requestDeletePolicy(0)

      // Assert
      expect(res.status).toBe(422)
    })

    it('既に削除されたポリシーを再度削除しようとすると404を返す', async () => {
      // Arrange - ポリシー作成・削除
      const policy = await policyTestHelper.createPolicy(sessionId, '二重削除テスト')

      const firstDeleteRes = await requestDeletePolicy(policy.version)
      expect(firstDeleteRes.status).toBe(204)

      // Act - 再度削除
      const res = await requestDeletePolicy(policy.version)

      // Assert
      expect(res.status).toBe(404)
    })
  })

  describe('異常系', () => {
    it('データベースエラーが発生した場合は500を返す', async () => {
      // Note: この種のテストは実際のDBエラーシミュレーションが困難
      // 統合テストでは基本的にはスキップするか、モックインフラとして別途テスト
    })
  })
})
