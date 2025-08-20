import { Nullable } from "@/common/types/utility";

export default class ActiveUser {
  constructor(
    public activeUserId: bigint,
    public userId: bigint,
    public email: string,
    public password: string,
    public displayName?: Nullable<string>,
    public lastLogin?: Date,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public readonly adminUserId: Nullable<number> = null,
  ) {}

  recordLogin(): void {
    this.lastLogin = new Date()
  }
}
