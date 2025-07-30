export default class User {
  constructor(
    public userId: bigint,
    public readonly createdAt: Date = new Date(),
  ) {
    // バリデーション（異常系テスト用）
    if (userId <= 0n) {
      throw new Error('User ID must be positive')
    }
  }
}
