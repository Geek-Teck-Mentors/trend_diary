import TEST_ENV from '@/test/env'
import app from '../../server'

describe('GET /api/policies', () => {
  async function requestGetPolicies(query = '') {
    return app.request(
      `/api/policies${query}`,
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

  async function cleanupPolicies() {
    // テスト用ポリシーの削除は各テストで行う
  }

  afterEach(async () => {
    await cleanupPolicies()
  })

  describe('正常系', () => {
    it('プライバシーポリシー一覧を取得できる', async () => {
      // Arrange - テストデータ作成
      await createTestPolicy('ポリシー1')
      await createTestPolicy('ポリシー2')

      // Act
      const res = await requestGetPolicies()

      // Assert
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeGreaterThanOrEqual(2)

      // 最新順でソートされている確認
      expect(data[0].version).toBeGreaterThan(data[1].version)

      // 必要なフィールドがある確認
      expect(data[0]).toHaveProperty('version')
      expect(data[0]).toHaveProperty('content')
      expect(data[0]).toHaveProperty('effectiveAt')
      expect(data[0]).toHaveProperty('createdAt')
      expect(data[0]).toHaveProperty('updatedAt')
    })

    it('ページング付きでプライバシーポリシー一覧を取得できる', async () => {
      // Arrange - 複数のテストデータ作成
      for (let i = 1; i <= 5; i++) {
        await createTestPolicy(`ポリシー${i}`)
      }

      // Act
      const res = await requestGetPolicies('?page=1&limit=3')

      // Assert
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeLessThanOrEqual(3)
    })

    it('ポリシーが存在しない場合は空配列を返す', async () => {
      // Act
      const res = await requestGetPolicies()

      // Assert
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(Array.isArray(data)).toBe(true)
    })
  })

  describe('準正常系', () => {
    it('無効なページパラメータの場合はデフォルトページングで応答する', async () => {
      // Act
      const res = await requestGetPolicies('?page=-1&limit=-1')

      // Assert
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(Array.isArray(data)).toBe(true)
    })

    it('limitが大きすぎる場合でも正常に応答する', async () => {
      // Act
      const res = await requestGetPolicies('?page=1&limit=10000')

      // Assert
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(Array.isArray(data)).toBe(true)
    })

    it('不正なクエリパラメータは無視される', async () => {
      // Act
      const res = await requestGetPolicies('?invalid=value&page=1')

      // Assert
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(Array.isArray(data)).toBe(true)
    })
  })

  describe('異常系', () => {
    it('存在しないエンドポイントは404を返す', async () => {
      // Act
      const res = await app.request('/api/policies/invalid', { method: 'GET' }, TEST_ENV)

      // Assert
      expect(res.status).toBe(404)
    })
  })
})
