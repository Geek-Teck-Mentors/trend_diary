import { PrivacyPolicyOutput } from '@/domain/policy'
import policyApiTestHelper from '@/test/helper/policyApiTestHelper'
import policyTestHelper from '@/test/helper/policyTestHelper'

describe('POST /api/policies/:version/clone', () => {
  beforeAll(async () => {
    await policyApiTestHelper.beforeAllSetup()
  })

  afterAll(async () => {
    await policyApiTestHelper.afterAllCleanup()
  })

  describe('正常系', () => {
    it('既存のポリシーを複製できる', async () => {
      // テストデータ準備：複製元のポリシーを作成
      const sourcePolicy = await policyTestHelper.createPolicy('複製元ポリシー内容')

      // API実行
      const response = await policyApiTestHelper.requestClonePolicy(sourcePolicy.version)

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
      const sourcePolicy = await policyTestHelper.createPolicy('有効化されたポリシー')
      await policyTestHelper.activatePolicy(sourcePolicy.version, new Date())

      // API実行
      const response = await policyApiTestHelper.requestClonePolicy(sourcePolicy.version)

      // レスポンス検証
      expect(response.status).toBe(201)
      const clonedPolicy = (await response.json()) as PrivacyPolicyOutput

      // 複製されたポリシーは下書き状態になる
      expect(clonedPolicy.content).toBe('有効化されたポリシー')
      expect(clonedPolicy.effectiveAt).toBe(null) // 下書き状態
    })
  })

  describe('準正常系', () => {
    it('認証されていない場合は401エラー', async () => {
      // 認証情報なしでリクエスト
      const response = await policyApiTestHelper.makeUnauthenticatedRequest(
        '/api/policies/1/clone',
        {
          method: 'POST',
          body: '{}',
        },
      )

      expect(response.status).toBe(401)
    })

    it('存在しないポリシーの複製時は404エラー', async () => {
      const response = await policyApiTestHelper.requestClonePolicy(999)

      expect(response.status).toBe(404)
      const error = (await response.json()) as { message: string }
      expect(error.message).toContain('複製元のプライバシーポリシーが見つかりません')
    })

    it('無効なバージョン番号時は422エラー', async () => {
      const response = await policyApiTestHelper.requestClonePolicy('invalid' as any)

      expect(response.status).toBe(422)
    })

    it('バージョン番号が0以下の場合は422エラー', async () => {
      const response = await policyApiTestHelper.requestClonePolicy(0)

      expect(response.status).toBe(422)
    })
  })
})
