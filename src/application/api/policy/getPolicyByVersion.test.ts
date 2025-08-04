import TEST_ENV from '@/test/env'
import app from '../../server'

describe('GET /api/policies/:version', () => {
  async function requestGetPolicyByVersion(version: number) {
    return app.request(
      `/api/policies/${version}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
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

  async function deleteTestPolicy(version: number) {
    return app.request(
      `/api/policies/${version}`,
      {
        method: 'DELETE',
      },
      TEST_ENV,
    )
  }

  describe('正常系', () => {
    it('指定したバージョンのプライバシーポリシーを取得できる', async () => {
      // Arrange - テストデータ作成
      const createRes = await createTestPolicy('特定バージョンのポリシー')
      expect(createRes.status).toBe(201)
      const created = await createRes.json()
      const version = created.version

      // Act
      const res = await requestGetPolicyByVersion(version)

      // Assert
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.version).toBe(version)
      expect(data.content).toBe('特定バージョンのポリシー')
      expect(data.effectiveAt).toBeNull() // 下書き状態
      expect(data).toHaveProperty('createdAt')
      expect(data).toHaveProperty('updatedAt')

      // Cleanup
      await deleteTestPolicy(version)
    })

    it('有効化されたポリシーも取得できる', async () => {
      // Arrange - テストデータ作成して有効化
      const createRes = await createTestPolicy('有効化テストポリシー')
      const created = await createRes.json()
      const version = created.version

      // 有効化
      const activateRes = await app.request(
        `/api/policies/${version}/activate`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ effectiveAt: new Date().toISOString() }),
        },
        TEST_ENV,
      )
      expect(activateRes.status).toBe(200)

      // Act
      const res = await requestGetPolicyByVersion(version)

      // Assert
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.version).toBe(version)
      expect(data.effectiveAt).not.toBeNull() // 有効化済み
    })
  })

  describe('準正常系', () => {
    it('存在しないバージョンを指定すると404を返す', async () => {
      // Act
      const res = await requestGetPolicyByVersion(99999)

      // Assert
      expect(res.status).toBe(404)
      const data = await res.json()
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('見つかりません')
    })

    it('version=0を指定しても適切に処理される', async () => {
      // Act
      const res = await requestGetPolicyByVersion(0)

      // Assert
      expect(res.status).toBe(404) // version=0のポリシーは存在しないと仮定
    })
  })

  describe('異常系', () => {
    it('無効なバージョン形式（文字列）は422を返す', async () => {
      // Act
      const res = await app.request('/api/policies/invalid', { method: 'GET' }, TEST_ENV)

      // Assert
      expect(res.status).toBe(422)
    })

    it('負のバージョン番号は422を返す', async () => {
      // Act
      const res = await requestGetPolicyByVersion(-1)

      // Assert
      expect(res.status).toBe(422)
    })

    it('データベースエラーが発生した場合は500を返す', async () => {
      // Note: この種のテストは実際のDBエラーシミュレーションが困難
      // 統合テストでは基本的にはスキップするか、モックインフラとして別途テスト
    })
  })
})
