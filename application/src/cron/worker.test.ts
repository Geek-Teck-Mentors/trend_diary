import { beforeEach, describe, expect, it, vi } from 'vitest'
import worker from './worker'

const runScheduledFetchMock = vi.hoisted(() => vi.fn())

vi.mock('./fetch-articles', () => ({
  runScheduledFetch: runScheduledFetchMock,
}))

describe('cron worker', () => {
  beforeEach(() => {
    runScheduledFetchMock.mockReset()
  })

  it('既知のcron式でfetchジョブを実行する', async () => {
    runScheduledFetchMock.mockResolvedValue(undefined)

    const waitUntilCalls: Promise<unknown>[] = []
    const event = { cron: '0 */8 * * *' } as ScheduledController
    const env = {
      DB: {} as D1Database,
      DISCORD_WEBHOOK_URL: '',
      LOG_LEVEL: 'silent' as const,
    }

    await worker.scheduled(event, env, {
      waitUntil: (promise: Promise<unknown>) => {
        waitUntilCalls.push(promise)
      },
    } as ExecutionContext)

    expect(waitUntilCalls).toHaveLength(1)
    await Promise.all(waitUntilCalls)
    expect(runScheduledFetchMock).toHaveBeenCalledTimes(3)
    expect(runScheduledFetchMock).toHaveBeenNthCalledWith(1, 'qiita', env, expect.anything())
    expect(runScheduledFetchMock).toHaveBeenNthCalledWith(2, 'zenn', env, expect.anything())
    expect(runScheduledFetchMock).toHaveBeenNthCalledWith(3, 'hatena', env, expect.anything())
  })

  it('cron式に関係なくfetchジョブを実行する', async () => {
    runScheduledFetchMock.mockResolvedValue(undefined)

    const waitUntilCalls: Promise<unknown>[] = []
    const event = { cron: '5 * * * *' } as ScheduledController
    const env = {
      DB: {} as D1Database,
      DISCORD_WEBHOOK_URL: '',
      LOG_LEVEL: 'silent' as const,
    }

    await worker.scheduled(event, env, {
      waitUntil: (promise: Promise<unknown>) => {
        waitUntilCalls.push(promise)
      },
    } as ExecutionContext)

    expect(waitUntilCalls).toHaveLength(1)
    await Promise.all(waitUntilCalls)
    expect(runScheduledFetchMock).toHaveBeenCalledTimes(3)
    expect(runScheduledFetchMock).toHaveBeenNthCalledWith(1, 'qiita', env, expect.anything())
    expect(runScheduledFetchMock).toHaveBeenNthCalledWith(2, 'zenn', env, expect.anything())
    expect(runScheduledFetchMock).toHaveBeenNthCalledWith(3, 'hatena', env, expect.anything())
  })

  it('片方のmediaで失敗しても残りのmediaは実行する', async () => {
    runScheduledFetchMock.mockImplementation(async (media: 'qiita' | 'zenn' | 'hatena') => {
      if (media === 'qiita') {
        throw new Error('qiita failed')
      }
    })

    const waitUntilCalls: Promise<unknown>[] = []
    const event = { cron: '0 */8 * * *' } as ScheduledController
    const env = {
      DB: {} as D1Database,
      DISCORD_WEBHOOK_URL: '',
      LOG_LEVEL: 'silent' as const,
    }

    await worker.scheduled(event, env, {
      waitUntil: (promise: Promise<unknown>) => {
        waitUntilCalls.push(promise)
      },
    } as ExecutionContext)

    expect(waitUntilCalls).toHaveLength(1)
    await Promise.all(waitUntilCalls)
    expect(runScheduledFetchMock).toHaveBeenCalledTimes(3)
    expect(runScheduledFetchMock).toHaveBeenNthCalledWith(1, 'qiita', env, expect.anything())
    expect(runScheduledFetchMock).toHaveBeenNthCalledWith(2, 'zenn', env, expect.anything())
    expect(runScheduledFetchMock).toHaveBeenNthCalledWith(3, 'hatena', env, expect.anything())
  })
})

type D1Database = import('@cloudflare/workers-types').D1Database
