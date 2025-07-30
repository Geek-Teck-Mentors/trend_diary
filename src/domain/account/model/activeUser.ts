export default class ActiveUser {
  constructor(
    public activeUserId: bigint,
    public userId: bigint,
    public email: string,
    public password: string,
    public displayName?: string | null,
    public lastLogin?: Date,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    // バリデーション（異常系テスト用）
    if (activeUserId <= 0n) {
      throw new Error('ActiveUser ID must be positive')
    }
    if (!email || email.trim() === '') {
      throw new Error('Email cannot be empty')
    }
  }

  recordLogin(): void {
    this.lastLogin = new Date()
  }
}