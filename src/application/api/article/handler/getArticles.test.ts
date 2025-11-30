import getRdbClient, { RdbClient } from '@/infrastructure/rdb'
import TEST_ENV from '@/test/env'
import activeUserTestHelper from '@/test/helper/activeUserTestHelper'
import articleTestHelper from '@/test/helper/articleTestHelper'
import app from '../../../server'
import { ArticleListResponse } from './getArticles'

type GetArticlesTestCase = {
  name: string
  query: string
  status: number
}

describe('GET /api/articles', () => {
  let db: RdbClient

  const testArticles = [
    {
      media: 'qiita',
      title: 'Reactの基礎',
      author: '山田太郎',
      description: 'Reactについて学ぼう',
      url: 'https://qiita.com/test1',
      createdAt: new Date('2025-05-11'),
    },
    {
      media: 'zenn',
      title: 'TypeScriptの応用',
      author: '佐藤花子',
      description: 'TypeScriptの高度な機能',
      url: 'https://zenn.dev/test2',
      createdAt: new Date('2025-05-12'),
    },
  ]

  async function cleanUp(): Promise<void> {
    await db.$queryRaw`TRUNCATE TABLE "articles";`
  }

  async function setupTestData(): Promise<void> {
    await Promise.all(testArticles.map((article) => db.article.create({ data: article })))
  }

  async function requestGetArticles(query: string = '', sessionId?: string) {
    const url = query ? `/api/articles?${query}` : '/api/articles'
    const headers = sessionId ? { Cookie: `sid=${sessionId}` } : {}
    return app.request(url, { method: 'GET', headers }, TEST_ENV)
  }

  beforeAll(() => {
    db = getRdbClient(TEST_ENV.DATABASE_URL)
  })

  afterAll(async () => {
    await db.$disconnect()
  })

  beforeEach(async () => {
    await setupTestData()
  })

  afterEach(async () => {
    await cleanUp()
  })

  describe('正常系', () => {
    it('全件取得', async () => {
      const res = await requestGetArticles()

      expect(res.status).toBe(200)
      const data: ArticleListResponse = await res.json()
      expect(data.data).toHaveLength(2)
      expect(data.data[0].title).toBe('TypeScriptの応用')
      expect(data.data[1].title).toBe('Reactの基礎')
      expect(data.hasNext).toBe(false)
      expect(data.hasPrev).toBe(false)
    })

    it('titleで検索', async () => {
      const res = await requestGetArticles('title=React')

      expect(res.status).toBe(200)
      const data: ArticleListResponse = await res.json()
      expect(data.data).toHaveLength(1)
      expect(data.data[0].title).toBe('Reactの基礎')
    })

    it('authorで検索', async () => {
      const res = await requestGetArticles('author=山田')

      expect(res.status).toBe(200)
      const data: ArticleListResponse = await res.json()
      expect(data.data).toHaveLength(1)
      expect(data.data[0].author).toBe('山田太郎')
    })

    it('mediaで検索', async () => {
      const res = await requestGetArticles('media=qiita')

      expect(res.status).toBe(200)
      const data: ArticleListResponse = await res.json()
      expect(data.data).toHaveLength(1)
      expect(data.data[0].media).toBe('qiita')
    })

    it('read_statusパラメータを受け取る', async () => {
      const res = await requestGetArticles('read_status=1')

      expect(res.status).toBe(200)
      const data: ArticleListResponse = await res.json()
      expect(data.data).toHaveLength(2)
    })

    it('複数条件での検索', async () => {
      const res = await requestGetArticles('media=qiita&author=山田')

      expect(res.status).toBe(200)
      const data: ArticleListResponse = await res.json()
      expect(data.data).toHaveLength(1)
      expect(data.data[0].title).toBe('Reactの基礎')
    })

    it('fromパラメータで検索', async () => {
      const res = await requestGetArticles('from=2025-05-12')

      expect(res.status).toBe(200)
      const data: ArticleListResponse = await res.json()
      expect(data.data).toHaveLength(1)
      expect(data.data[0].title).toBe('TypeScriptの応用')
    })

    it('toパラメータで検索', async () => {
      const res = await requestGetArticles('to=2025-05-11')

      expect(res.status).toBe(200)
      const data: ArticleListResponse = await res.json()
      expect(data.data).toHaveLength(1)
      expect(data.data[0].title).toBe('Reactの基礎')
    })

    it('from/toパラメータの範囲検索', async () => {
      const res = await requestGetArticles('from=2025-05-11&to=2025-05-12')

      expect(res.status).toBe(200)
      const data: ArticleListResponse = await res.json()
      expect(data.data).toHaveLength(2)
    })

    it('from/toパラメータの範囲検索（該当なし）', async () => {
      const res = await requestGetArticles('from=2025-05-13&to=2025-05-14')

      expect(res.status).toBe(200)
      const data: ArticleListResponse = await res.json()
      expect(data.data).toHaveLength(0)
    })

    describe('既読ステータス', () => {
      let testActiveUserId: bigint
      let sessionId: string
      let articleIds: bigint[]

      beforeEach(async () => {
        // ユーザーを作成してログイン
        await activeUserTestHelper.create('readtest@example.com', 'password123')
        const loginData = await activeUserTestHelper.login('readtest@example.com', 'password123')
        testActiveUserId = loginData.activeUserId
        sessionId = loginData.sessionId

        // 記事IDを取得
        const articles = await db.article.findMany()
        articleIds = articles.map((a) => a.articleId)

        // 1つ目の記事に既読履歴を作成
        if (articleIds.length > 0) {
          await articleTestHelper.createReadHistory(testActiveUserId, articleIds[0])
        }
      })

      afterEach(async () => {
        await activeUserTestHelper.cleanUp()
        await articleTestHelper.cleanUpReadHistories()
      })

      it('認証済みユーザーの場合、既読ステータスが含まれる', async () => {
        const res = await requestGetArticles('', sessionId)

        expect(res.status).toBe(200)
        const data: ArticleListResponse = await res.json()
        expect(data.data).toHaveLength(2)
        // TypeScriptの応用（2つ目の記事）は既読
        expect(data.data[0].hasRead).toBe(true)
        // Reactの基礎（1つ目の記事）は未読
        expect(data.data[1].hasRead).toBe(false)
      })

      it('認証なしの場合、hasReadはundefinedになる', async () => {
        const res = await requestGetArticles()

        expect(res.status).toBe(200)
        const data: ArticleListResponse = await res.json()
        expect(data.data).toHaveLength(2)
        expect(data.data[0].hasRead).toBeUndefined()
        expect(data.data[1].hasRead).toBeUndefined()
      })
    })
  })

  describe('準正常系', () => {
    const testCases: GetArticlesTestCase[] = [
      {
        name: '不正なmedia値',
        query: 'media=invalid',
        status: 422,
      },
      {
        name: '不正なread_status値',
        query: 'read_status=2',
        status: 422,
      },
      {
        name: '不正なfrom形式',
        query: 'from=2025/05/11',
        status: 422,
      },
      {
        name: '不正なto形式',
        query: 'to=2025/05/11',
        status: 422,
      },
      {
        name: 'fromがtoより後の日付',
        query: 'from=2025-05-12&to=2025-05-11',
        status: 422,
      },
    ]

    testCases.forEach((testCase) => {
      it(testCase.name, async () => {
        const res = await requestGetArticles(testCase.query)
        expect(res.status).toBe(testCase.status)
      })
    })
  })
})
