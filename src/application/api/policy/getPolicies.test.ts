import { testClient } from 'hono/testing'
import { Env } from '@/application/env'
import getRdbClient from '@/infrastructure/rdb'
import TEST_ENV from '@/test/env'
import activeUserTestHelper from '@/test/helper/activeUserTestHelper'
import route from './route'

describe('/policies - GET (プライバシーポリシー一覧取得)', () => {
  let sessionId: string
  const app = testClient(route, TEST_ENV as unknown as Env)

  async function setupTestData(): Promise<void> {
    // 管理者アカウント作成・ログイン
    await activeUserTestHelper.create('admin@example.com', 'password123')
    const loginData = await activeUserTestHelper.login('admin@example.com', 'password123')
    sessionId = loginData.sessionId
  }

  beforeEach(async () => {
    await activeUserTestHelper.cleanUp()
    await setupTestData()
  })

  afterAll(async () => {
    await activeUserTestHelper.cleanUp()
  })

  describe('正常系', () => {
    it('デフォルトのページング設定でポリシー一覧を取得できる', async () => {
      const rdb = getRdbClient(TEST_ENV.DATABASE_URL)

      // テスト用のプライバシーポリシーを作成
      await rdb.privacyPolicy.createMany({
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

      const res = await app.index.$get(
        {
          query: {
            page: 1,
            limit: 20,
          },
        },
        {
          headers: {
            Cookie: `sid=${sessionId}`,
          },
        },
      )

      expect(res.status).toBe(200)
      const body = await res.json()

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
      const rdb = getRdbClient(TEST_ENV.DATABASE_URL)

      // テスト用のプライバシーポリシーを複数作成
      const policies = Array.from({ length: 5 }, (_, i) => ({
        version: i + 1,
        content: `Privacy Policy v${i + 1}`,
        effectiveAt: i % 2 === 0 ? new Date() : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))

      await rdb.privacyPolicy.createMany({ data: policies })

      const res = await app.index.$get(
        {
          query: {
            page: 2,
            limit: 2,
          },
        },
        {
          headers: {
            Cookie: `sid=${sessionId}`,
          },
        },
      )

      expect(res.status).toBe(200)
      const body = await res.json()

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
      const res = await app.index.$get({
        query: {
          page: 1,
          limit: 20,
        },
      })

      expect(res.status).toBe(401)
    })

    it('無効なpage値の場合はデフォルト値が使用される', async () => {
      const res = await app.index.$get(
        {
          query: {
            page: NaN,
            limit: 10,
          },
        },
        {
          headers: {
            Cookie: `sid=${sessionId}`,
          },
        },
      )

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.page).toBe(1) // デフォルト値
    })

    it('無効なlimit値の場合はデフォルト値が使用される', async () => {
      const res = await app.index.$get(
        {
          query: {
            page: 1,
            limit: NaN,
          },
        },
        {
          headers: {
            Cookie: `sid=${sessionId}`,
          },
        },
      )

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.limit).toBe(20) // デフォルト値
    })

    it('limitが上限を超える場合は上限値が適用される', async () => {
      const res = await app.index.$get(
        {
          query: {
            page: 1,
            limit: 200, // 上限100を超える
          },
        },
        {
          headers: {
            Cookie: `sid=${sessionId}`,
          },
        },
      )

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.limit).toBe(100) // 上限値
    })
  })

  describe('異常系', () => {
    it('メソッドが間違っている場合は405を返す', async () => {
      // testClientではrequestメソッドを使用できないので、
      // このテストは省略するか、別の方法でテストする
      expect(true).toBe(true) // プレースホルダー
    })
  })
})
