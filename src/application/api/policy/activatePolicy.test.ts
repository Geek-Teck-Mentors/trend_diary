import TEST_ENV from '@/test/env'
import app from '../../server'

describe('PATCH /api/policies/:version/activate', () => {
  async function requestActivatePolicy(version: number, body: string) {
    return app.request(
      `/api/policies/${version}/activate`,
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

  async function _getPolicyByVersion(version: number) {
    return app.request(
      `/api/policies/${version}`,
      {
        method: 'GET',
      },
      TEST_ENV,
    )
  }

  describe('正常系', () => {
    it('下書き状態のポリシーを有効化できる', async () => {
      // Arrange - 下書きポリシー作成
      const createRes = await createTestPolicy('有効化予定ポリシー')
      expect(createRes.status).toBe(201)
      const original = await createRes.json()
      const version = original.version

      const effectiveDate = new Date('2024-02-01T00:00:00Z')
      const requestBody = JSON.stringify({ effectiveAt: effectiveDate.toISOString() })

      // Act
      const res = await requestActivatePolicy(version, requestBody)

      // Assert
      expect(res.status).toBe(200)
      const activated = await res.json()
      expect(activated.version).toBe(version)
      expect(activated.content).toBe(original.content)
      expect(activated.effectiveAt).toBe(effectiveDate.toISOString())
      expect(activated).toHaveProperty('updatedAt')
      expect(new Date(activated.updatedAt).getTime()).toBeGreaterThan(
        new Date(original.updatedAt).getTime(),
      )

      // 有効化後は削除できないことを確認
      const deleteRes = await deleteTestPolicy(version)
      expect(deleteRes.status).toBe(400)
    })

    it('現在日時で有効化できる', async () => {
      // Arrange
      const createRes = await createTestPolicy('現在日時有効化ポリシー')
      const original = await createRes.json()
      const version = original.version

      const now = new Date()
      const requestBody = JSON.stringify({ effectiveAt: now.toISOString() })

      // Act
      const res = await requestActivatePolicy(version, requestBody)

      // Assert
      expect(res.status).toBe(200)
      const activated = await res.json()
      expect(activated.effectiveAt).toBe(now.toISOString())
    })

    it('未来日時で有効化できる', async () => {
      // Arrange
      const createRes = await createTestPolicy('未来日時有効化ポリシー')
      const original = await createRes.json()
      const version = original.version

      const futureDate = new Date('2025-12-31T23:59:59Z')
      const requestBody = JSON.stringify({ effectiveAt: futureDate.toISOString() })

      // Act
      const res = await requestActivatePolicy(version, requestBody)

      // Assert
      expect(res.status).toBe(200)
      const activated = await res.json()
      expect(activated.effectiveAt).toBe(futureDate.toISOString())
    })

    it('過去日時でも有効化できる', async () => {
      // Arrange
      const createRes = await createTestPolicy('過去日時有効化ポリシー')
      const original = await createRes.json()
      const version = original.version

      const pastDate = new Date('2020-01-01T00:00:00Z')
      const requestBody = JSON.stringify({ effectiveAt: pastDate.toISOString() })

      // Act
      const res = await requestActivatePolicy(version, requestBody)

      // Assert
      expect(res.status).toBe(200)
      const activated = await res.json()
      expect(activated.effectiveAt).toBe(pastDate.toISOString())
    })
  })

  describe('準正常系', () => {
    it('存在しないバージョンを有効化しようとすると404を返す', async () => {
      // Act
      const res = await requestActivatePolicy(
        99999,
        JSON.stringify({ effectiveAt: new Date().toISOString() }),
      )

      // Assert
      expect(res.status).toBe(404)
      const data = await res.json()
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('見つかりません')
    })

    it('既に有効化されたポリシーを再度有効化しようとすると400を返す', async () => {
      // Arrange - ポリシー作成して有効化
      const createRes = await createTestPolicy('二重有効化テスト')
      const original = await createRes.json()
      const version = original.version

      const firstActivateRes = await requestActivatePolicy(
        version,
        JSON.stringify({ effectiveAt: new Date().toISOString() }),
      )
      expect(firstActivateRes.status).toBe(200)

      // Act - 再度有効化
      const res = await requestActivatePolicy(
        version,
        JSON.stringify({ effectiveAt: new Date().toISOString() }),
      )

      // Assert
      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('既に有効化されています')
    })

    it('effectiveAtが存在しない場合は422を返す', async () => {
      // Arrange
      const createRes = await createTestPolicy('effectiveAt不正テスト')
      const original = await createRes.json()
      const version = original.version

      // Act
      const res = await requestActivatePolicy(version, JSON.stringify({}))

      // Assert
      expect(res.status).toBe(422)

      // Cleanup
      await deleteTestPolicy(version)
    })

    it('effectiveAtが無効な日付形式の場合は422を返す', async () => {
      // Arrange
      const createRes = await createTestPolicy('日付形式不正テスト')
      const original = await createRes.json()
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

    it('無効なバージョン形式（文字列）は422を返す', async () => {
      // Act
      const res = await app.request(
        '/api/policies/invalid/activate',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ effectiveAt: new Date().toISOString() }),
        },
        TEST_ENV,
      )

      // Assert
      expect(res.status).toBe(422)
    })

    it('負のバージョン番号は422を返す', async () => {
      // Act
      const res = await requestActivatePolicy(
        -1,
        JSON.stringify({ effectiveAt: new Date().toISOString() }),
      )

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
        `/api/policies/${version}/activate`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: '{ effectiveAt: invalid json }',
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
        '/api/policies/1/activate',
        {
          method: 'POST', // PATCHでないメソッド
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ effectiveAt: new Date().toISOString() }),
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
        `/api/policies/${version}/activate`,
        {
          method: 'PATCH',
          body: JSON.stringify({ effectiveAt: new Date().toISOString() }),
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
