import TEST_ENV from '@/test/env'
import app from '../../server'

describe('DELETE /api/policies/:version', () => {
  async function requestDeletePolicy(version: number) {
    return app.request(
      `/api/policies/${version}`,
      {
        method: 'DELETE',
      },
      TEST_ENV,
    )
  }

  async function createTestPolicy(content = 'テストポリシー') {
    return app.request(
      '/api/policies',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      },
      TEST_ENV,
    )
  }

  async function activatePolicy(version: number) {
    return app.request(
      `/api/policies/${version}/activate`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ effectiveAt: new Date().toISOString() }),
      },
      TEST_ENV,
    )
  }

  async function getPolicyByVersion(version: number) {
    return app.request(
      `/api/policies/${version}`,
      {
        method: 'GET',
      },
      TEST_ENV,
    )
  }

  describe('正常系', () => {
    it('下書き状態のポリシーを削除できる', async () => {
      // Arrange - 下書きポリシー作成
      const createRes = await createTestPolicy('削除予定ポリシー')
      expect(createRes.status).toBe(201)
      const original = await createRes.json()
      const version = original.version

      // Act
      const res = await requestDeletePolicy(version)

      // Assert
      expect(res.status).toBe(204) // No Content

      // 削除されたことを確認
      const getRes = await getPolicyByVersion(version)
      expect(getRes.status).toBe(404)
    })

    it('複数の下書きポリシーをそれぞれ削除できる', async () => {
      // Arrange - 複数の下書きポリシー作成
      const createRes1 = await createTestPolicy('削除予定ポリシー1')
      const createRes2 = await createTestPolicy('削除予定ポリシー2')
      const policy1 = await createRes1.json()
      const policy2 = await createRes2.json()

      // Act
      const res1 = await requestDeletePolicy(policy1.version)
      const res2 = await requestDeletePolicy(policy2.version)

      // Assert
      expect(res1.status).toBe(204)
      expect(res2.status).toBe(204)

      // 削除されたことを確認
      const getRes1 = await getPolicyByVersion(policy1.version)
      const getRes2 = await getPolicyByVersion(policy2.version)
      expect(getRes1.status).toBe(404)
      expect(getRes2.status).toBe(404)
    })
  })

  describe('準正常系', () => {
    it('存在しないバージョンを削除しようとすると404を返す', async () => {
      // Act
      const res = await requestDeletePolicy(99999)

      // Assert
      expect(res.status).toBe(404)
      const data = await res.json()
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('見つかりません')
    })

    it('有効化されたポリシーを削除しようとすると400を返す', async () => {
      // Arrange - ポリシー作成して有効化
      const createRes = await createTestPolicy('有効化後削除テスト')
      const original = await createRes.json()
      const version = original.version

      const activateRes = await activatePolicy(version)
      expect(activateRes.status).toBe(200)

      // Act
      const res = await requestDeletePolicy(version)

      // Assert
      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('有効化されたポリシーは削除できません')

      // 削除されていないことを確認
      const getRes = await getPolicyByVersion(version)
      expect(getRes.status).toBe(200)
    })

    it('無効なバージョン形式（文字列）は422を返す', async () => {
      // Act
      const res = await app.request('/api/policies/invalid', { method: 'DELETE' }, TEST_ENV)

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
      const createRes = await createTestPolicy('二重削除テスト')
      const original = await createRes.json()
      const version = original.version

      const firstDeleteRes = await requestDeletePolicy(version)
      expect(firstDeleteRes.status).toBe(204)

      // Act - 再度削除
      const res = await requestDeletePolicy(version)

      // Assert
      expect(res.status).toBe(404)
    })
  })

  describe('異常系', () => {
    it('メソッドが間違っている場合は405を返す', async () => {
      // Act
      const res = await app.request(
        '/api/policies/1',
        { method: 'POST' }, // DELETEでないメソッド
        TEST_ENV,
      )

      // Assert
      expect(res.status).toBe(405)
    })

    it('存在しないエンドポイントは404を返す', async () => {
      // Act
      const res = await app.request('/api/policies/1/invalid', { method: 'DELETE' }, TEST_ENV)

      // Assert
      expect(res.status).toBe(404)
    })

    it('データベースエラーが発生した場合は500を返す', async () => {
      // Note: この種のテストは実際のDBエラーシミュレーションが困難
      // 統合テストでは基本的にはスキップするか、モックインフラとして別途テスト
    })
  })
})
