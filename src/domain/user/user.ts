import BaseModel from '../../common/baseModel';
import UUID from '../../common/uuid';

export default class User extends BaseModel {
  constructor(
    public userId: UUID,
    public accountId: UUID,
    public displayName?: string,
    public readonly createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
    deletedAt?: Date,
  ) {
    super(createdAt, updatedAt, deletedAt);
  }

  static create(accountId: UUID, displayName?: string): User {
    return new User(UUID.new(), accountId, displayName);
  }

  deactivate(): void {
    this.deactivate();
  }
}
