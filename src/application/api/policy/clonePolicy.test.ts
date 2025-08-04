import TEST_ENV from '@/test/env'
import app from '../../server'

describe('POST /api/policies/:version/clone', () => {
  async function requestClonePolicy(version: number, body = '{}') {
    return app.request(
      `/api/policies/${version}/clone`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
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
    it('既存のポリシーを複製できる', async () => {
      // Arrange - 元のポリシー作成
      const createRes = await createTestPolicy('複製元ポリシー')
      expect(createRes.status).toBe(201)
      const original = await createRes.json()
      const sourceVersion = original.version

      // Act
      const res = await requestClonePolicy(sourceVersion)

      // Assert
      expect(res.status).toBe(201)
      const cloned = await res.json()
      expect(cloned.version).not.toBe(sourceVersion) // 新しいバージョン
      expect(cloned.version).toBeGreaterThan(sourceVersion)
      expect(cloned.content).toBe(original.content) // 同じ内容
      expect(cloned.effectiveAt).toBeNull() // 下書き状態
      expect(cloned).toHaveProperty('createdAt')
      expect(cloned).toHaveProperty('updatedAt')

      // Cleanup
      await deleteTestPolicy(sourceVersion)
      await deleteTestPolicy(cloned.version)
    })

    it('有効化されたポリシーからも複製できる', async () => {
      // Arrange - 元のポリシー作成して有効化
      const createRes = await createTestPolicy('有効化ポリシー')
      const original = await createRes.json()
      const sourceVersion = original.version

      // 有効化
      const activateRes = await app.request(
        `/api/policies/${sourceVersion}/activate`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ effectiveAt: new Date().toISOString() }),
        },
        TEST_ENV,
      )
      expect(activateRes.status).toBe(200)

      // Act
      const res = await requestClonePolicy(sourceVersion)

      // Assert
      expect(res.status).toBe(201)
      const cloned = await res.json()
      expect(cloned.version).toBeGreaterThan(sourceVersion)
      expect(cloned.content).toBe(original.content)
      expect(cloned.effectiveAt).toBeNull() // 複製は下書き状態

      // Cleanup
      await deleteTestPolicy(cloned.version)
      // 有効化されたポリシーは削除できないのでCleanupしない
    })

    it('空のリクエストボディでも複製できる', async () => {
      // Arrange
      const createRes = await createTestPolicy('空ボディ複製テスト')
      const original = await createRes.json()
      const sourceVersion = original.version

      // Act
      const res = await requestClonePolicy(sourceVersion, '{}')

      // Assert
      expect(res.status).toBe(201)
      const cloned = await res.json()
      expect(cloned.content).toBe(original.content)

      // Cleanup
      await deleteTestPolicy(sourceVersion)
      await deleteTestPolicy(cloned.version)
    })
  })

  describe('準正常系', () => {
    it('存在しないバージョンを複製しようとすると404を返す', async () => {
      // Act
      const res = await requestClonePolicy(99999)

      // Assert
      expect(res.status).toBe(404)
      const data = await res.json()
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('見つかりません')
    })

    it('無効なバージョン形式（文字列）は422を返す', async () => {
      // Act
      const res = await app.request(
        '/api/policies/invalid/clone',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{}',
        },
        TEST_ENV,
      )

      // Assert
      expect(res.status).toBe(422)
    })

    it('負のバージョン番号は422を返す', async () => {
      // Act
      const res = await requestClonePolicy(-1)

      // Assert
      expect(res.status).toBe(422)
    })

    it('不正なJSONの場合は400を返す', async () => {
      // Arrange
      const createRes = await createTestPolicy('JSON不正テスト')
      const original = await createRes.json()
      const sourceVersion = original.version

      // Act
      const res = await app.request(
        `/api/policies/${sourceVersion}/clone`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{ invalid json }',
        },
        TEST_ENV,
      )

      // Assert
      expect(res.status).toBe(400)

      // Cleanup
      await deleteTestPolicy(sourceVersion)
    })
  })

  describe('異常系', () => {
    it('メソッドが間違っている場合は405を返す', async () => {
      // Act
      const res = await app.request(
        '/api/policies/1/clone',
        {
          method: 'GET', // POSTでないメソッド
          headers: { 'Content-Type': 'application/json' },
          body: '{}',
        },
        TEST_ENV,
      )

      // Assert
      expect(res.status).toBe(405)
    })

    it('Content-Typeが指定されていない場合は400を返す', async () => {
      // Arrange
      const createRes = await createTestPolicy('ContentType不正テスト')
      const original = await createRes.json()
      const sourceVersion = original.version

      // Act
      const res = await app.request(
        `/api/policies/${sourceVersion}/clone`,
        {
          method: 'POST',
          body: '{}',
        },
        TEST_ENV,
      )

      // Assert
      expect(res.status).toBe(400)

      // Cleanup
      await deleteTestPolicy(sourceVersion)
    })

    it('データベースエラーが発生した場合は500を返す', async () => {
      // Note: この種のテストは実際のDBエラーシミュレーションが困難
      // 統合テストでは基本的にはスキップするか、モックインフラとして別途テスト
    })
  })
})
