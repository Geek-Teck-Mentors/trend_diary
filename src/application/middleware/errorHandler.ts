import { HTTPException } from 'hono/http-exception'
import { Context } from 'hono'
import { RequestInfo } from '@/common/adapters/notification'
import CONTEXT_KEY from './context'
import { Env } from '../env'
import DiscordNotifier from '@/infrastructure/discordNotifier'

/**
 * Discordにエラー通知を送信する
 */
const notifyDiscord = (err: Error, webhookUrl: string, requestInfo: RequestInfo): void => {
  const notifier = new DiscordNotifier(webhookUrl)

  // Discord通知をバックグラウンドで実行
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  notifier.error(err, requestInfo)
}

const errorHandler = async (err: Error, c: Context<Env>): Promise<Response> => {
  const logger = c.get(CONTEXT_KEY.APP_LOG)

  // Discord通知を送信（5xxエラーの場合）
  const discordWebhookUrl = c.env.DISCORD_WEBHOOK_URL
  const requestInfo: RequestInfo = {
    url: c.req.url,
    method: c.req.method,
    userAgent: c.req.header('User-Agent') || '',
  }

  if (err instanceof HTTPException) {
    if (err.status >= 500) notifyDiscord(err, discordWebhookUrl, requestInfo)

    return c.json(
      {
        message: err.message,
      },
      {
        status: err.status,
      },
    )
  }

  // 予期しないエラーの場合
  logger.error('Unhandled error', err)
  notifyDiscord(err, discordWebhookUrl, requestInfo)

  return c.json('Internal Server Error', { status: 500 })
}

export default errorHandler
