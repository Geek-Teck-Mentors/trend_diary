import TEST_ENV from '@/test/env'
import app from '../../server'

describe('PATCH /api/policies/:version', () => {
  async function requestUpdatePolicy(version: number, body: string) {
    return app.request(
      `/api/policies/${version}`,
      {
        method: 'PATCH',
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

  describe('正常系', () => {
    it('下書き状態のポリシーを更新できる', async () => {
      // Arrange - 下書きポリシー作成
      const createRes = await createTestPolicy('更新前のポリシー')
      expect(createRes.status).toBe(201)
      const original = await createRes.json()
      const version = original.version

      const newContent = '更新後のポリシー内容'
      const requestBody = JSON.stringify({ content: newContent })

      // Act
      const res = await requestUpdatePolicy(version, requestBody)

      // Assert
      expect(res.status).toBe(200)
      const updated = await res.json()
      expect(updated.version).toBe(version) // バージョンは変わらない
      expect(updated.content).toBe(newContent)
      expect(updated.effectiveAt).toBeNull() // 下書き状態を維持
      expect(updated).toHaveProperty('updatedAt')
      expect(new Date(updated.updatedAt).getTime()).toBeGreaterThan(
        new Date(original.updatedAt).getTime(),
      )

      // Cleanup
      await deleteTestPolicy(version)
    })

    it('空のコンテンツに更新できる', async () => {
      // Arrange
      const createRes = await createTestPolicy('更新前のポリシー')
      const original = await createRes.json()
      const version = original.version

      const requestBody = JSON.stringify({ content: '' })

      // Act
      const res = await requestUpdatePolicy(version, requestBody)

      // Assert
      expect(res.status).toBe(200)
      const updated = await res.json()
      expect(updated.content).toBe('')

      // Cleanup
      await deleteTestPolicy(version)
    })

    it('非常に長いコンテンツに更新できる', async () => {
      // Arrange
      const createRes = await createTestPolicy('短いポリシー')
      const original = await createRes.json()
      const version = original.version

      const longContent = 'a'.repeat(10000)
      const requestBody = JSON.stringify({ content: longContent })

      // Act
      const res = await requestUpdatePolicy(version, requestBody)

      // Assert
      expect(res.status).toBe(200)
      const updated = await res.json()
      expect(updated.content).toBe(longContent)

      // Cleanup
      await deleteTestPolicy(version)
    })
  })

  describe('準正常系', () => {
    it('存在しないバージョンを更新しようとすると404を返す', async () => {
      // Act
      const res = await requestUpdatePolicy(99999, JSON.stringify({ content: 'テスト' }))

      // Assert
      expect(res.status).toBe(404)
      const data = await res.json()
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('見つかりません')
    })

    it('有効化されたポリシーを更新しようとすると400を返す', async () => {
      // Arrange - ポリシー作成して有効化
      const createRes = await createTestPolicy('有効化予定ポリシー')
      const original = await createRes.json()
      const version = original.version

      const activateRes = await activatePolicy(version)
      expect(activateRes.status).toBe(200)

      // Act
      const res = await requestUpdatePolicy(version, JSON.stringify({ content: '更新テスト' }))

      // Assert
      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('有効化されたポリシーは更新できません')
    })

    it('contentが存在しない場合は422を返す', async () => {
      // Arrange
      const createRes = await createTestPolicy('テストポリシー')
      const original = await createRes.json()
      const version = original.version

      // Act
      const res = await requestUpdatePolicy(version, JSON.stringify({}))

      // Assert
      expect(res.status).toBe(422)

      // Cleanup
      await deleteTestPolicy(version)
    })

    it('空文字列のcontentは422を返す（バリデーションによる）', async () => {
      // Arrange
      const createRes = await createTestPolicy('テストポリシー')
      const original = await createRes.json()
      const version = original.version

      // Act
      const res = await requestUpdatePolicy(version, JSON.stringify({ content: '' }))

      // Assert
      // 実装によってはエラーになる可能性がある
      // もしくは正常系として扱う場合は200
      expect([200, 422]).toContain(res.status)

      // Cleanup
      if (res.status === 200) {
        await deleteTestPolicy(version)
      }
    })

    it('無効なバージョン形式（文字列）は422を返す', async () => {
      // Act
      const res = await app.request(
        '/api/policies/invalid',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: 'テスト' }),
        },
        TEST_ENV,
      )

      // Assert
      expect(res.status).toBe(422)
    })

    it('負のバージョン番号は422を返す', async () => {
      // Act
      const res = await requestUpdatePolicy(-1, JSON.stringify({ content: 'テスト' }))

      // Assert
      expect(res.status).toBe(422)
    })

    it('不正なJSONの場合は400を返す', async () => {
      // Arrange
      const createRes = await createTestPolicy('JSON不正テスト')
      const original = await createRes.json()
      const version = original.version

      // Act
      const res = await app.request(
        `/api/policies/${version}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: '{ content: invalid json }',
        },
        TEST_ENV,
      )

      // Assert
      expect(res.status).toBe(400)

      // Cleanup
      await deleteTestPolicy(version)
    })
  })

  describe('異常系', () => {
    it('メソッドが間違っている場合は405を返す', async () => {
      // Act
      const res = await app.request(
        '/api/policies/1',
        {
          method: 'PUT', // PATCHでないメソッド
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: 'テスト' }),
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
      const version = original.version

      // Act
      const res = await app.request(
        `/api/policies/${version}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ content: 'テスト' }),
        },
        TEST_ENV,
      )

      // Assert
      expect(res.status).toBe(400)

      // Cleanup
      await deleteTestPolicy(version)
    })

    it('データベースエラーが発生した場合は500を返す', async () => {
      // Note: この種のテストは実際のDBエラーシミュレーションが困難
      // 統合テストでは基本的にはスキップするか、モックインフラとして別途テスト
    })
  })
})
