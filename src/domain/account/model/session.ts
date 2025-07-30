export default class Session {
  private _forceExpired = false

  constructor(
    public sessionId: string,
    public activeUserId: bigint,
    public sessionToken?: string,
    public expiresAt: Date = new Date(Date.now() + 24 * 60 * 60 * 1000), // デフォルト24時間後
    public ipAddress?: string,
    public userAgent?: string,
    public readonly createdAt: Date = new Date(),
    forceExpired = false, // テスト用のフラグ
  ) {
    // バリデーション（異常系テスト用）
    if (!sessionId || sessionId.trim() === '') {
      throw new Error('Session ID cannot be empty')
    }
    if (activeUserId <= 0n) {
      throw new Error('ActiveUser ID must be positive')
    }
    // 通常作成時のみ未来時刻チェック（テスト用にforcecreatedをスキップ）
    if (!forceExpired && expiresAt <= new Date()) {
      throw new Error('Session expiry must be in the future')
    }
    this._forceExpired = forceExpired
  }

  isValid(): boolean {
    return new Date() < this.expiresAt
  }

  invalidate(): void {
    this.expiresAt = new Date() // 現在時刻に設定して無効化
  }
}
