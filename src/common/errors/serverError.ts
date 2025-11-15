export default class ServerError extends Error {
  public readonly statusCode: number = 500

  constructor(error: unknown, statusCode?: number) {
    super(error instanceof Error ? error.message : String(error))
    this.name = 'ServerError'
    if (statusCode) this.statusCode = statusCode
  }

  // 例外をキャッチしてサーバーエラーのハンドリングを行う関数
  static handle(error: unknown): ServerError {
    if (error instanceof ServerError) return error
    if (error instanceof Error) return new ServerError(error)

    return new ServerError(String(error))
  }
}
