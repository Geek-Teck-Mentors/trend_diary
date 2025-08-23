import { ChatNotifier, RequestInfo } from '@/adapters/notification'

type DiscordEmbed = {
  title: string
  color: number
  fields: Array<{
    name: string
    value: string
    inline: boolean
  }>
  timestamp: string
}

type DiscordWebhookPayload = {
  content: string | null
  embeds: DiscordEmbed[]
}

class DiscordNotifier implements ChatNotifier {
  private readonly webhookUrl: string

  private readonly maxFieldLength = 1018 // Discord field limit (1024) minus code block chars (6)

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl
  }

  async error(error: Error, requestInfo: RequestInfo): Promise<void> {
    if (this.webhookUrl === '') return

    try {
      const payload = this.createErrorPayload(error, requestInfo)

      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
    } catch (_notificationError) {
      // Discord通知の失敗は元のエラー処理に影響させない
    }
  }

  private createErrorPayload(error: Error, requestInfo: RequestInfo): DiscordWebhookPayload {
    const stackTrace = this.truncateField(error.stack || 'No stack trace available')

    return {
      content: null,
      embeds: [
        {
          title: '🚨 5xx Server Error Occurred',
          color: 15158332, // Red color (#E74C3C)
          fields: [
            {
              name: 'Error Message',
              value: `\`\`\`\n${error.message}\n\`\`\``,
              inline: false,
            },
            {
              name: 'Request Info',
              value: `\`\`\`\nMethod: ${requestInfo.method}\nURL: ${requestInfo.url}\nUser-Agent: ${requestInfo.userAgent}\n\`\`\``,
              inline: false,
            },
            {
              name: 'Stack Trace',
              value: `\`\`\`\n${stackTrace}\n\`\`\``,
              inline: false,
            },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    }
  }

  private truncateField(text: string): string {
    const codeBlockChars = 8 // ```\n + \n```
    const truncatedSuffix = '...(truncated)'
    const maxContentLength = this.maxFieldLength - codeBlockChars - truncatedSuffix.length

    if (text.length <= maxContentLength) {
      return text
    }

    return text.substring(0, maxContentLength) + truncatedSuffix
  }
}

export default DiscordNotifier
