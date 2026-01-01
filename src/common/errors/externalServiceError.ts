import ServerError from './serverError'

/**
 * 外部サービスエラー
 * 外部サービス（Supabase Auth等）との連携で問題が発生した場合に使用
 */
export default class ExternalServiceError extends ServerError {
  public readonly originalError: ServerError
  public readonly serviceError: ServerError
  public readonly context: Record<string, unknown>

  constructor(
    originalError: ServerError,
    serviceError: ServerError,
    context: Record<string, unknown> = {},
  ) {
    super('External service error')
    this.name = 'ExternalServiceError'
    this.originalError = originalError
    this.serviceError = serviceError
    this.context = context
  }
}
