import BaseModel from '@/common/model/baseModel';

export default class ReadHistory extends BaseModel {
  constructor(
    public readHistoryId: bigint,
    public userId: bigint,
    public articleId: bigint,
    public readAt: Date,
    public readonly createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
    deletedAt?: Date,
  ) {
    super(createdAt, updatedAt, deletedAt);
  }
}
