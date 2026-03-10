import { Prisma } from '@prisma/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const fetchMock = vi.hoisted(() => vi.fn())
const parseStringMock = vi.hoisted(() => vi.fn())
const findManyMock = vi.hoisted(() => vi.fn())
const createMock = vi.hoisted(() => vi.fn())
const disconnectMock = vi.hoisted(() => vi.fn())
const prismaDisconnectKey = vi.hoisted(() => '$disconnect')

vi.stubGlobal('fetch', fetchMock)

vi.mock('rss-parser', () => ({
  default: class MockParser {
    parseString(xml: string) {
      return parseStringMock(xml)
    }
  },
}))

vi.mock('@/infrastructure/rdb', () => ({
  default: vi.fn(() => ({
    article: {
      findMany: findManyMock,
      create: createMock,
    },
    [prismaDisconnectKey]: disconnectMock,
  })),
}))

import { fetchHatenaArticles } from '@/cron/fetch-articles'

describe('fetchHatenaArticles', () => {
  const env = {
    DB: {} as D1Database,
    DATABASE_URL: 'file:./test.db',
  }

  beforeEach(() => {
    fetchMock.mockReset()
    parseStringMock.mockReset()
    findManyMock.mockReset()
    createMock.mockReset()
    disconnectMock.mockReset()

    fetchMock.mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue('<rss />'),
    })
    findManyMock.mockResolvedValue([])
    createMock.mockResolvedValue({})
    disconnectMock.mockResolvedValue(undefined)
  })

  it('creatorが欠損した記事はauthorをフォールバック値で補完する', async () => {
    parseStringMock.mockResolvedValue({
      items: [
        {
          title: '記事タイトル',
          content: '本文',
          link: 'https://example.com/1',
        },
      ],
    })

    const count = await fetchHatenaArticles(env)

    expect(count).toBe(1)
    expect(fetchMock).toHaveBeenCalledWith('https://b.hatena.ne.jp/hotentry/it.rss')
    const createArg = createMock.mock.calls[0][0] as {
      data: { author: string; description: string }
    }
    expect(createArg.data).toMatchObject({
      author: 'はてなブックマーク',
      description: '本文',
    })
  })

  it('D1互換のため記事は1件ずつ保存する', async () => {
    parseStringMock.mockResolvedValue({
      items: [
        {
          title: '記事A',
          creator: '投稿者A',
          content: '本文A',
          link: 'https://example.com/a',
        },
        {
          title: '記事B',
          creator: '投稿者B',
          content: '本文B',
          link: 'https://example.com/b',
        },
      ],
    })

    const count = await fetchHatenaArticles(env)

    expect(count).toBe(2)
    expect(createMock).toHaveBeenCalledTimes(2)
  })

  it('同一URLの重複記事は1件だけ保存する', async () => {
    parseStringMock.mockResolvedValue({
      items: [
        {
          title: '記事A',
          creator: '投稿者A',
          content: '本文A',
          link: 'https://example.com/a',
        },
        {
          title: '記事A重複',
          creator: '投稿者A',
          content: '本文A重複',
          link: 'https://example.com/a',
        },
      ],
    })

    const count = await fetchHatenaArticles(env)

    expect(count).toBe(1)
    expect(createMock).toHaveBeenCalledTimes(1)
  })

  it('保存時に一意制約違反が発生した記事はスキップして継続する', async () => {
    parseStringMock.mockResolvedValue({
      items: [
        {
          title: '記事A',
          creator: '投稿者A',
          content: '本文A',
          link: 'https://example.com/a',
        },
        {
          title: '記事B',
          creator: '投稿者B',
          content: '本文B',
          link: 'https://example.com/b',
        },
      ],
    })
    createMock
      .mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('duplicate', {
          code: 'P2002',
          clientVersion: '6.7.0',
        }),
      )
      .mockResolvedValueOnce({})

    const count = await fetchHatenaArticles(env)

    expect(count).toBe(1)
    expect(createMock).toHaveBeenCalledTimes(2)
  })

  it('contentが欠損した記事は優先順位でdescriptionを補完する', async () => {
    parseStringMock.mockResolvedValue({
      items: [
        {
          title: '記事1',
          creator: '投稿者1',
          'content:encoded': 'encoded本文',
          link: 'https://example.com/1',
        },
        {
          title: '記事2',
          creator: '投稿者2',
          contentSnippet: 'snippet本文',
          link: 'https://example.com/2',
        },
        {
          title: '記事3',
          creator: '投稿者3',
          link: 'https://example.com/3',
        },
      ],
    })

    const count = await fetchHatenaArticles(env)

    expect(count).toBe(3)
    const createArgs = createMock.mock.calls as Array<[{ data: { description: string } }]>
    expect(createArgs[0][0].data.description).toBe('encoded本文')
    expect(createArgs[1][0].data.description).toBe('snippet本文')
    expect(createArgs[2][0].data.description).toBe('')
  })
})

type D1Database = import('@cloudflare/workers-types').D1Database
