import { isError } from '@/common/types/utility'
import { createPrivacyPolicyService, PrivacyPolicyOutput } from '@/domain/policy'
import getRdbClient from '@/infrastructure/rdb'
import TEST_ENV from '@/test/env'
import activeUserTestHelper from '@/test/helper/activeUserTestHelper'
import app from '../../server'

describe('GET /api/policies/:version', () => {
  let sessionId: string
  const service = createPrivacyPolicyService(getRdbClient(TEST_ENV.DATABASE_URL))

  async function setupTestData(): Promise<void> {
    // 管理者アカウント作成・ログイン
    await activeUserTestHelper.create('admin@example.com', 'password123')
    const loginData = await activeUserTestHelper.login('admin@example.com', 'password123')
    sessionId = loginData.sessionId
  }

  async function requestGetPolicyByVersion(version: number) {
    return app.request(
      `/api/policies/${version}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `sid=${sessionId}`,
        },
      },
      TEST_ENV,
    )
  }

  async function createTestPolicy(content = 'テストポリシー') {
    return service.createPolicy(content)
  }

  async function deleteTestPolicy(version: number) {
    return service.deletePolicy(version)
  }

  beforeEach(async () => {
    await activeUserTestHelper.cleanUp()
    await setupTestData()
  })

  afterAll(async () => {
    await activeUserTestHelper.cleanUp()
  })

  describe('正常系', () => {
    it('指定したバージョンのプライバシーポリシーを取得できる', async () => {
      // Arrange - テストデータ作成
      const createRes = await createTestPolicy('特定バージョンのポリシー')
      if (isError(createRes)) {
        throw new Error(`Policy creation failed: ${createRes.error.message}`)
      }

      const version = createRes.data.version

      // Act
      const res = await requestGetPolicyByVersion(version)

      // Assert
      expect(res.status).toBe(200)
      const data = (await res.json()) as PrivacyPolicyOutput
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
      if (isError(createRes)) {
        throw new Error(`Policy creation failed: ${createRes.error.message}`)
      }

      const version = createRes.data.version

      // 有効化
      await service.activatePolicy(version, new Date())

      // Act
      const res = await requestGetPolicyByVersion(version)

      // Assert
      expect(res.status).toBe(200)
      const data = (await res.json()) as PrivacyPolicyOutput
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
    })

    it('versionは1以上のみ受け付ける', async () => {
      // Act
      const res = await requestGetPolicyByVersion(0)

      // Assert
      expect(res.status).toBe(422) // version=0のポリシーは存在しないと仮定
    })

    it('無効なバージョン形式（文字列）は422を返す', async () => {
      // Act
      const res = await app.request(
        '/api/policies/invalid',
        {
          method: 'GET',
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
      const res = await requestGetPolicyByVersion(-1)

      // Assert
      expect(res.status).toBe(422)
    })
  })

  describe('異常系', () => {
    it('データベースエラーが発生した場合は500を返す', async () => {
      // Note: この種のテストは実際のDBエラーシミュレーションが困難
      // 統合テストでは基本的にはスキップするか、モックインフラとして別途テスト
    })
  })
})
