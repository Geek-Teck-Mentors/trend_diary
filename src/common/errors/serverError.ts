export default class ServerError extends Error {
  public readonly statusCode: number = 500;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'ServerError';
    if (statusCode) this.statusCode = statusCode;
  }

  // 例外をキャッチしてサーバーエラーのハンドリングを行う関数
  static handle(error: any): Error {
    if (error instanceof ServerError) return error;

    if (error instanceof Error)
      return new ServerError(`Failed to deactivate account: ${error.message}`);

    return new ServerError(`Failed to deactivate account: ${error}`);
  }
}
