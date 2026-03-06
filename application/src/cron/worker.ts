import Logger from '@/common/logger'
import type { ArticleMedia } from '@/domain/article/media'
import { runScheduledFetch } from './fetch-articles'

type D1Database = import('@cloudflare/workers-types').D1Database

type CronWorkerEnv = {
  DB: D1Database
  DATABASE_URL?: string
  DISCORD_WEBHOOK_URL: string
  LOG_LEVEL?: import('@/common/logger').LogLevel
}

const MEDIA_LIST: ReadonlyArray<ArticleMedia> = ['qiita', 'zenn', 'hatena']

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

export default {
  async scheduled(event: ScheduledController, env: CronWorkerEnv, ctx: ExecutionContext) {
    const logger = new Logger(env.LOG_LEVEL || 'info', {
      scope: 'cron-worker',
      cron: event.cron,
    })

    ctx.waitUntil(
      (async () => {
        for (const media of MEDIA_LIST) {
          try {
            await runScheduledFetch(media, env, logger)
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            logger.error({ msg: 'cron fetch failed', media }, error)
            await notifyDiscord(
              env.DISCORD_WEBHOOK_URL,
              `[trend-diary cron] fetch failed\ncron: ${event.cron}\nmedia: ${media}\nerror: ${message}`,
            )
          }
        }
      })(),
    )
  },
}
