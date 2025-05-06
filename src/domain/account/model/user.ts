import BaseModel from '@/common/model/baseModel';

export default class User extends BaseModel {
  constructor(
    public userId: bigint,
    public accountId: bigint,
    public displayName?: string,
    public readonly createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
    deletedAt?: Date,
  ) {
    super(createdAt, updatedAt, deletedAt);
  }
}
