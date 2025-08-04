import getRdbClient, { RdbClient } from '@/infrastructure/rdb'
import TEST_ENV from '@/test/env'
import policyApiTestHelper from '@/test/helper/policyApiTestHelper'
import policyTestHelper from '@/test/helper/policyTestHelper'
import { PolicyListResponse } from './response'

describe('GET /api/policies', () => {
  let db: RdbClient

  beforeAll(async () => {
    await policyApiTestHelper.beforeAllSetup()
    db = getRdbClient(TEST_ENV.DATABASE_URL)
  })

  afterAll(async () => {
    await policyApiTestHelper.afterAllCleanup()
    await db.$disconnect()
  })

  describe('正常系', () => {
    beforeEach(async () => {
      await policyTestHelper.cleanUp()
      // テスト用のプライバシーポリシーを作成
      await db.privacyPolicy.createMany({
        data: [
          {
            version: 1,
            content: 'Privacy Policy v1',
            effectiveAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            version: 2,
            content: 'Privacy Policy v2',
            effectiveAt: null, // 下書き
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      })
    })

    it('デフォルトのページング設定でポリシー一覧を取得できる', async () => {
      const res = await policyApiTestHelper.requestGetPolicies('page=1&limit=20')

      expect(res.status).toBe(200)
      const body: PolicyListResponse = await res.json()

      expect(body).toHaveProperty('data')
      expect(body).toHaveProperty('page', 1)
      expect(body).toHaveProperty('limit', 20)
      expect(body).toHaveProperty('total')
      expect(body).toHaveProperty('totalPages')
      expect(body).toHaveProperty('hasNext')
      expect(body).toHaveProperty('hasPrev', false)

      expect(Array.isArray(body.data)).toBe(true)
      expect(body.data.length).toBe(2)

      // バージョンの降順でソートされていることを確認
      expect(body.data[0].version).toBe(2)
      expect(body.data[1].version).toBe(1)
    })

    it('カスタムページング設定でポリシー一覧を取得できる', async () => {
      // 追加のテスト用プライバシーポリシーを作成
      const additionalPolicies = Array.from({ length: 3 }, (_, i) => ({
        version: i + 3,
        content: `Privacy Policy v${i + 3}`,
        effectiveAt: i % 2 === 0 ? new Date() : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))

      await db.privacyPolicy.createMany({ data: additionalPolicies })

      const res = await policyApiTestHelper.requestGetPolicies('page=2&limit=2')

      expect(res.status).toBe(200)
      const body: PolicyListResponse = await res.json()

      expect(body.page).toBe(2)
      expect(body.limit).toBe(2)
      expect(body.total).toBe(5)
      expect(body.totalPages).toBe(3)
      expect(body.hasNext).toBe(true)
      expect(body.hasPrev).toBe(true)
      expect(body.data.length).toBe(2)
    })
  })

  describe('準正常系', () => {
    it('認証されていない場合は401エラーが返される', async () => {
      const res = await policyApiTestHelper.makeUnauthenticatedRequest(
        '/api/policies?page=1&limit=20',
        {
          method: 'GET',
        },
      )

      expect(res.status).toBe(401)
    })

    it('無効なpage値の場合はデフォルト値が使用される', async () => {
      const res = await policyApiTestHelper.requestGetPolicies('page=invalid&limit=10')

      expect(res.status).toBe(200)
      const body: PolicyListResponse = await res.json()
      expect(body.page).toBe(1) // デフォルト値
    })

    it('無効なlimit値の場合はデフォルト値が使用される', async () => {
      const res = await policyApiTestHelper.requestGetPolicies('page=1&limit=invalid')

      expect(res.status).toBe(200)
      const body: PolicyListResponse = await res.json()
      expect(body.limit).toBe(20) // デフォルト値
    })

    it('limitが上限を超える場合は上限値が適用される', async () => {
      const res = await policyApiTestHelper.requestGetPolicies('page=1&limit=200')

      expect(res.status).toBe(200)
      const body: PolicyListResponse = await res.json()
      expect(body.limit).toBe(100) // 上限値
    })
  })
})
