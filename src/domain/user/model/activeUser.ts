export default class ActiveUser {
  constructor(
    public activeUserId: bigint,
    public userId: bigint,
    public email: string,
    public password: string,
    public displayName?: string | null,
    public lastLogin?: Date,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}

  recordLogin(): void {
    this.lastLogin = new Date()
  }
}
