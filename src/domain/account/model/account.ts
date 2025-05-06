import BaseModel from '@/common/model/baseModel';

export default class Account extends BaseModel {
  constructor(
    public accountId: bigint,
    public email: string,
    public password: string,
    public lastLogin?: Date,
    public readonly createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
    deletedAt?: Date,
  ) {
    super(createdAt, updatedAt, deletedAt);
  }

  recordLogin(): void {
    this.lastLogin = new Date();
  }
}
