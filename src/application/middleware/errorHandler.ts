import { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { DiscordNotifier } from '@/infrastructure/notification'
import { Env } from '../env'
import CONTEXT_KEY from './context'

export interface RequestInfo {
  url: string
  method: string
  userAgent: string
}

export interface ChatNotifier {
  error(error: Error, requestInfo: RequestInfo): Promise<void>
}

/**
 * Discordにエラー通知を送信する
 */
const notifyDiscord = (chatNotifier: ChatNotifier, err: Error, requestInfo: RequestInfo): void => {
  // Discord通知をバックグラウンドで実行
  chatNotifier.error(err, requestInfo)
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

  const chatNotifier = new DiscordNotifier(discordWebhookUrl)
  if (err instanceof HTTPException) {
    if (err.status >= 500) notifyDiscord(chatNotifier, err, requestInfo)

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
  notifyDiscord(chatNotifier, err, requestInfo)

  return c.json('Internal Server Error', { status: 500 })
}

export default errorHandler
