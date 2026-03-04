import Logger from '@/common/logger'
import { runScheduledFetch } from './fetch-articles'

type D1Database = import('@cloudflare/workers-types').D1Database

type CronWorkerEnv = {
  DB: D1Database
  DATABASE_URL?: string
  DISCORD_WEBHOOK_URL: string
  LOG_LEVEL?: import('@/common/logger').LogLevel
  QIITA_CRON?: string
  ZENN_CRON?: string
}

const DEFAULT_QIITA_CRON = '0 */8 * * *'
const DEFAULT_ZENN_CRON = '0 */8 * * *'

async function notifyDiscord(webhookUrl: string, message: string) {
  if (!webhookUrl) return

  await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: message,
    }),
  })
}

function resolveMedia(cron: string, env: CronWorkerEnv): Array<'qiita' | 'zenn'> {
  const qiitaCron = env.QIITA_CRON || DEFAULT_QIITA_CRON
  const zennCron = env.ZENN_CRON || DEFAULT_ZENN_CRON

  if (cron === qiitaCron && cron === zennCron) return ['qiita', 'zenn']
  if (cron === qiitaCron) return ['qiita']
  if (cron === zennCron) return ['zenn']
  return []
}

export default {
  async scheduled(event: ScheduledController, env: CronWorkerEnv, ctx: ExecutionContext) {
    const logger = new Logger(env.LOG_LEVEL || 'info', {
      scope: 'cron-worker',
      cron: event.cron,
    })

    const mediaList = resolveMedia(event.cron, env)
    if (mediaList.length === 0) {
      logger.warn({
        msg: 'unknown cron expression. skip',
        cron: event.cron,
      })
      return
    }

    ctx.waitUntil(
      (async () => {
        try {
          for (const media of mediaList) {
            await runScheduledFetch(media, env, logger)
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          logger.error({ msg: 'cron fetch failed', mediaList }, error)
          await notifyDiscord(
            env.DISCORD_WEBHOOK_URL,
            `[trend-diary cron] fetch failed\ncron: ${event.cron}\nmedia: ${mediaList.join(',')}\nerror: ${message}`,
          )
        }
      })(),
    )
  },
}
