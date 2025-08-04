import { PrivacyPolicyOutput } from '@/domain/policy'
import TEST_ENV from '@/test/env'
import policyTestHelper from '@/test/helper/policyTestHelper'
import app from '../../server'

describe('POST /api/policies/:version/clone', () => {
  let sessionId: string

  async function requestClonePolicy(version: number, body = '{}') {
    return app.request(
      `/api/policies/${version}/clone`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `sid=${sessionId}`,
        },
        body,
      },
      TEST_ENV,
    )
  }

  beforeEach(async () => {
    await policyTestHelper.cleanUpAll()
    sessionId = await policyTestHelper.setupUserSession()
  })

  describe('正常系', () => {
    it('既存のポリシーを複製できる', async () => {
      // テストデータ準備：複製元のポリシーを作成
      const sourcePolicy = await policyTestHelper.createPolicy(sessionId, '複製元ポリシー内容')

      // API実行
      const response = await requestClonePolicy(sourcePolicy.version)

      // レスポンス検証
      expect(response.status).toBe(201)
      const clonedPolicy = (await response.json()) as PrivacyPolicyOutput

      // 複製されたポリシーの検証
      expect(clonedPolicy.version).toBeGreaterThan(sourcePolicy.version)
      expect(clonedPolicy.content).toBe('複製元ポリシー内容')
      expect(clonedPolicy.effectiveAt).toBe(null) // 下書き状態
      expect(clonedPolicy.createdAt).toBeDefined()
      expect(clonedPolicy.updatedAt).toBeDefined()
    })

    it('有効化されたポリシーも複製できる', async () => {
      // テストデータ準備：有効化されたポリシーを作成
      const sourcePolicy = await policyTestHelper.createPolicy(sessionId, '有効化されたポリシー')
      await policyTestHelper.activatePolicy(sourcePolicy.version, new Date())

      // API実行
      const response = await requestClonePolicy(sourcePolicy.version)

      // レスポンス検証
      expect(response.status).toBe(201)
      const clonedPolicy = (await response.json()) as PrivacyPolicyOutput

      // 複製されたポリシーは下書き状態になる
      expect(clonedPolicy.content).toBe('有効化されたポリシー')
      expect(clonedPolicy.effectiveAt).toBe(null) // 下書き状態
    })
  })

  describe('準正常系', () => {
    it('存在しないポリシーの複製時は404エラー', async () => {
      const response = await requestClonePolicy(999)

      expect(response.status).toBe(404)
      const error = (await response.json()) as { message: string }
      expect(error.message).toContain('複製元のプライバシーポリシーが見つかりません')
    })

    it('無効なバージョン番号時は422エラー', async () => {
      const response = await app.request(
        '/api/policies/invalid/clone',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Cookie: `sid=${sessionId}`,
          },
          body: '{}',
        },
        TEST_ENV,
      )

      expect(response.status).toBe(422)
    })

    it('バージョン番号が0以下の場合は422エラー', async () => {
      const response = await requestClonePolicy(0)

      expect(response.status).toBe(422)
    })

    it('不正なJSONの場合は400エラー', async () => {
      // テストデータ準備
      const sourcePolicy = await policyTestHelper.createPolicy(sessionId, 'JSON不正テスト')

      const response = await app.request(
        `/api/policies/${sourcePolicy.version}/clone`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Cookie: `sid=${sessionId}`,
          },
          body: '{ invalid json }',
        },
        TEST_ENV,
      )

      expect(response.status).toBe(400)
    })
  })

  describe('異常系', () => {
    it('認証されていない場合は401エラー', async () => {
      // 認証情報なしでリクエスト
      const response = await app.request(
        '/api/policies/1/clone',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: '{}',
        },
        TEST_ENV,
      )

      expect(response.status).toBe(401)
    })
  })

  // cleanup
  afterAll(async () => {
    await policyTestHelper.cleanUpAll()
    await policyTestHelper.disconnect()
  })
})
