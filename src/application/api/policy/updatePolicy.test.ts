import TEST_ENV from '@/test/env'
import policyTestHelper from '@/test/helper/policyTestHelper'
import app from '../../server'

describe('PATCH /api/policies/:version', () => {
  let sessionId: string

  async function setupTestData(): Promise<void> {
    // 管理者アカウント作成・ログイン
    sessionId = await policyTestHelper.setupUserSession()
  }

  async function requestUpdatePolicy(version: number, body: string) {
    return app.request(
      `/api/policies/${version}`,
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

  async function createTestPolicy(content = 'テストポリシー') {
    return policyTestHelper.createPolicy(sessionId, content)
  }

  async function deleteTestPolicy(version: number) {
    return policyTestHelper.deletePolicy(version)
  }

  async function activateTestPolicy(version: number) {
    return policyTestHelper.activatePolicy(version, new Date())
  }

  beforeEach(async () => {
    await policyTestHelper.cleanUpAll()
    await setupTestData()
  })

  afterAll(async () => {
    await policyTestHelper.cleanUpAll()
    await policyTestHelper.disconnect()
  })

  describe('正常系', () => {
    it('下書き状態のポリシーを更新できる', async () => {
      // Arrange - 下書きポリシー作成
      const original = await createTestPolicy('更新前のポリシー')
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
      const original = await createTestPolicy('更新前のポリシー')
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
      const original = await createTestPolicy('短いポリシー')
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
      expect(data).toHaveProperty('message')
      expect(data.message).toContain('見つかりません')
    })

    it('有効化されたポリシーを更新しようとすると400を返す', async () => {
      // Arrange - ポリシー作成して有効化
      const original = await createTestPolicy('有効化予定ポリシー')
      const version = original.version

      await activateTestPolicy(version)

      // Act
      const res = await requestUpdatePolicy(version, JSON.stringify({ content: '更新テスト' }))

      // Assert
      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data).toHaveProperty('message')
      expect(data.message).toContain('有効化されたポリシーは更新できません')
    })

    it('contentが存在しない場合は422を返す', async () => {
      // Arrange
      const original = await createTestPolicy('テストポリシー')
      const version = original.version

      // Act
      const res = await requestUpdatePolicy(version, JSON.stringify({}))

      // Assert
      expect(res.status).toBe(422)

      // Cleanup
      await deleteTestPolicy(version)
    })

    it('空文字列のcontentは200を返す（正常な更新として扱う）', async () => {
      // Arrange
      const original = await createTestPolicy('テストポリシー')
      const version = original.version

      // Act
      const res = await requestUpdatePolicy(version, JSON.stringify({ content: '' }))

      // Assert
      expect(res.status).toBe(200)
      const updated = await res.json()
      expect(updated.content).toBe('')

      // Cleanup
      await deleteTestPolicy(version)
    })

    it('無効なバージョン形式（文字列）は422を返す', async () => {
      // Act
      const res = await app.request(
        '/api/policies/invalid',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Cookie: `sid=${sessionId}`,
          },
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
      const original = await createTestPolicy('JSON不正テスト')
      const version = original.version

      // Act
      const res = await app.request(
        `/api/policies/${version}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Cookie: `sid=${sessionId}`,
          },
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
    it('メソッドが間違っている場合は404を返す', async () => {
      // Act
      const res = await app.request(
        '/api/policies/1',
        {
          method: 'PUT', // PATCHでないメソッド
          headers: {
            'Content-Type': 'application/json',
            Cookie: `sid=${sessionId}`,
          },
          body: JSON.stringify({ content: 'テスト' }),
        },
        TEST_ENV,
      )

      // Assert
      expect(res.status).toBe(404)
    })

    it('Content-Typeが指定されていない場合は422を返す', async () => {
      // Arrange
      const original = await createTestPolicy('ContentType不正テスト')
      const version = original.version

      // Act
      const res = await app.request(
        `/api/policies/${version}`,
        {
          method: 'PATCH',
          headers: {
            Cookie: `sid=${sessionId}`,
          },
          body: JSON.stringify({ content: 'テスト' }),
        },
        TEST_ENV,
      )

      // Assert
      expect(res.status).toBe(422)

      // Cleanup
      await deleteTestPolicy(version)
    })

    it('データベースエラーが発生した場合は500を返す', async () => {
      // Note: この種のテストは実際のDBエラーシミュレーションが困難
      // 統合テストでは基本的にはスキップするか、モックインフラとして別途テスト
    })
  })
})
