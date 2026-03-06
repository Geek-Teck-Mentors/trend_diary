import { beforeEach, describe, expect, it, vi } from 'vitest'

const fetchMock = vi.hoisted(() => vi.fn())
const parseStringMock = vi.hoisted(() => vi.fn())
const findManyMock = vi.hoisted(() => vi.fn())
const createManyMock = vi.hoisted(() => vi.fn())
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
      createMany: createManyMock,
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
    createManyMock.mockReset()
    disconnectMock.mockReset()

    fetchMock.mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue('<rss />'),
    })
    findManyMock.mockResolvedValue([])
    createManyMock.mockImplementation(async ({ data }: { data: unknown[] }) => ({
      count: data.length,
    }))
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
    const createManyArg = createManyMock.mock.calls[0][0] as {
      data: Array<{ author: string; description: string }>
    }
    expect(createManyArg.data[0]).toMatchObject({
      author: 'はてなブックマーク',
      description: '本文',
    })
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
    const createManyArg = createManyMock.mock.calls[0][0] as {
      data: Array<{ description: string }>
    }
    expect(createManyArg.data[0].description).toBe('encoded本文')
    expect(createManyArg.data[1].description).toBe('snippet本文')
    expect(createManyArg.data[2].description).toBe('')
  })
})

type D1Database = import('@cloudflare/workers-types').D1Database
