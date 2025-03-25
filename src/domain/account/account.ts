import BaseModel from '../../common/baseModel';
import UUID from '../../common/uuid';

export default class Account extends BaseModel {
  constructor(
    public accountId: UUID,
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

  deactivate(): void {
    this.deactivate();
  }
}
