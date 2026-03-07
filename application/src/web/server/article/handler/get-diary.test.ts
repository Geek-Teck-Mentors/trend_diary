import { isFailure } from '@yuukihayashi0510/core'
import { addJstDays, toJstDateString } from '@/common/locale/date'
import TEST_ENV from '@/test/env'
import * as articleHelper from '@/test/helper/article'
import type { CleanUpIds } from '@/test/helper/user'
import * as userHelper from '@/test/helper/user'
import app from '@/web/server'

type DiaryResponse = {
  date: string
  sources: Array<{
    media: string
    read: number
    skip: number
  }>
  reads: {
    data: Array<{
      readHistoryId: string
      articleId: string
      media: string
      title: string
      readAt: string
    }>
    page: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

const getTodayJst = () => {
  const result = toJstDateString(new Date())
  if (isFailure(result)) throw result.error
  return result.data
}

function toJstDateTime(date: string, time: string) {
  return new Date(`${date}T${time}+09:00`)
}

async function requestDiary(query?: string, cookies?: string) {
  const suffix = query ? `?${query}` : ''
  const headers: Record<string, string> = {}
  if (cookies) {
    headers.Cookie = cookies
  }

  return app.request(
    `/api/articles/diary${suffix}`,
    {
      method: 'GET',
      headers,
    },
    TEST_ENV,
  )
}

describe('GET /api/articles/diary', () => {
  let authCookies: string
  let activeUserId: bigint
  let todayJst: string
  const createdArticleIds: bigint[] = []
  const createdUserIds: CleanUpIds = { userIds: [], authIds: [] }

  beforeEach(async () => {
    todayJst = getTodayJst()
    const { userId, authenticationId } = await userHelper.create(
      'diary-test@example.com',
      'Test@password123',
    )
    createdUserIds.userIds.push(userId)
    createdUserIds.authIds.push(authenticationId)

    const loginData = await userHelper.login('diary-test@example.com', 'Test@password123')
    authCookies = loginData.cookies
    activeUserId = loginData.activeUserId

    const qiitaArticle = await articleHelper.createArticle({
      media: 'qiita',
      title: 'Go error handling',
      createdAt: toJstDateTime(todayJst, '09:00:00'),
    })
    const zennArticle = await articleHelper.createArticle({
      media: 'zenn',
      title: 'Bun runtime',
      createdAt: toJstDateTime(todayJst, '09:30:00'),
    })
    createdArticleIds.push(qiitaArticle.articleId, zennArticle.articleId)

    await articleHelper.createReadHistory(
      activeUserId,
      qiitaArticle.articleId,
      toJstDateTime(todayJst, '10:00:00'),
    )
    await articleHelper.createReadHistory(
      activeUserId,
      qiitaArticle.articleId,
      toJstDateTime(todayJst, '10:05:00'),
    )
    await articleHelper.createReadHistory(
      activeUserId,
      zennArticle.articleId,
      toJstDateTime(todayJst, '11:00:00'),
    )
    await articleHelper.createSkippedArticle(activeUserId, zennArticle.articleId)
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

  it('指定日のダイアリーを取得できる', async () => {
    const response = await requestDiary(`date=${todayJst}`, authCookies)

    expect(response.status).toBe(200)
    const json = (await response.json()) as DiaryResponse
    expect(json.date).toBe(todayJst)
    expect(json.sources).toEqual([
      { media: 'qiita', read: 2, skip: 0 },
      { media: 'zenn', read: 1, skip: 1 },
      { media: 'hatena', read: 0, skip: 0 },
    ])
    expect(json.reads.page).toBe(1)
    expect(json.reads.data).toHaveLength(3)
    expect(json.reads.data[0].title).toBe('Bun runtime')
  })

  it('page指定でread一覧をページングできる', async () => {
    const response = await requestDiary(`date=${todayJst}&page=2`, authCookies)

    expect(response.status).toBe(200)
    const json = (await response.json()) as DiaryResponse
    expect(json.reads.page).toBe(2)
    expect(json.reads.data).toHaveLength(0)
    expect(json.reads.hasPrev).toBe(true)
  })

  it('未認証時は401', async () => {
    const response = await requestDiary(`date=${todayJst}`)
    expect(response.status).toBe(401)
  })

  it('不正なdate形式は422', async () => {
    const response = await requestDiary('date=2026/03/07', authCookies)
    expect(response.status).toBe(422)
  })

  it('7日範囲外の日付は422', async () => {
    const tooOldDateResult = addJstDays(todayJst, -7)
    if (isFailure(tooOldDateResult)) throw tooOldDateResult.error

    const response = await requestDiary(`date=${tooOldDateResult.data}`, authCookies)
    expect(response.status).toBe(422)
  })
})
