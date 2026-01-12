import TEST_ENV from '@/test/env'
import * as articleHelper from '@/test/helper/article'
import type { CleanUpIds } from '@/test/helper/user'
import * as userHelper from '@/test/helper/user'
import app from '../../../server'

import { ArticleListResponse, ArticleWithReadStatusResponse } from './get-articles'

type GetArticlesTestCase = {
  name: string
  query: string
  status: number
}

async function requestGetArticles(query: string = '', cookies?: string) {
  const url = query ? `/api/articles?${query}` : '/api/articles'
  const headers: Record<string, string> = {}
  if (cookies) {
    headers.Cookie = cookies
  }
  return app.request(url, { method: 'GET', headers }, TEST_ENV)
}

describe('GET /api/articles', () => {
  const testArticlesData = [
    {
      media: 'qiita' as const,
      title: 'Reactの基礎',
      author: '山田太郎',
      description: 'Reactについて学ぼう',
      url: 'https://qiita.com/test1',
      createdAt: new Date('2025-05-11'),
    },
    {
      media: 'zenn' as const,
      title: 'TypeScriptの応用',
      author: '佐藤花子',
      description: 'TypeScriptの高度な機能',
      url: 'https://zenn.dev/test2',
      createdAt: new Date('2025-05-12'),
    },
  ]

  const createdArticleIds: bigint[] = []

  beforeAll(async () => {
    const articles = await Promise.all(
      testArticlesData.map((article) => articleHelper.createArticle(article)),
    )
    createdArticleIds.push(...articles.map((a) => a.articleId))
  })

  afterAll(async () => {
    await articleHelper.cleanUp(createdArticleIds)
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

describe('GET /api/articles 既読情報', () => {
  let authCookies: string
  const createdArticleIds: bigint[] = []
  const createdUserIds: CleanUpIds = { userIds: [], authIds: [] }

  beforeEach(async () => {
    // アカウント作成・ログイン
    const { userId, authenticationId } = await userHelper.create(
      'readtest@example.com',
      'Test@password123',
    )
    createdUserIds.userIds.push(userId)
    createdUserIds.authIds.push(authenticationId)

    const loginData = await userHelper.login('readtest@example.com', 'Test@password123')
    const testActiveUserId = loginData.activeUserId
    authCookies = loginData.cookies

    // テスト記事作成
    const article1 = await articleHelper.createArticle({
      title: '既読記事',
      author: 'テスト著者1',
    })
    createdArticleIds.push(article1.articleId)

    const article2 = await articleHelper.createArticle({
      title: '未読記事',
      author: 'テスト著者2',
    })
    createdArticleIds.push(article2.articleId)

    // article1を既読にする
    await articleHelper.createReadHistory(testActiveUserId, article1.articleId)
  })

  afterEach(async () => {
    await Promise.allSettled([
      userHelper.cleanUp(createdUserIds),
      articleHelper.cleanUp(createdArticleIds),
    ])
    createdUserIds.userIds.length = 0
    createdUserIds.authIds.length = 0
    createdArticleIds.length = 0
  })

  it('未ログインの場合はisReadがundefined', async () => {
    // 認証状態をログアウトにする
    await userHelper.logout()

    const res = await requestGetArticles()
    expect(res.status).toBe(200)
    const data: ArticleListResponse = await res.json()
    expect(data.data).toHaveLength(2)
    for (const article of data.data) {
      expect(article.isRead).toBeUndefined()
    }
  })

  it('ログイン時は既読記事にisRead: trueが返される', async () => {
    const res = await requestGetArticles('title=既読記事', authCookies)

    expect(res.status).toBe(200)
    const data = (await res.json()) as { data: ArticleWithReadStatusResponse[] }
    expect(data.data).toHaveLength(1)
    expect(data.data[0].isRead).toBe(true)
  })

  it('ログイン時は未読記事にisRead: falseが返される', async () => {
    const res = await requestGetArticles('title=未読記事', authCookies)

    expect(res.status).toBe(200)
    const data = (await res.json()) as { data: ArticleWithReadStatusResponse[] }
    expect(data.data).toHaveLength(1)
    expect(data.data[0].isRead).toBe(false)
  })
})
