export default class BaseModel {
  public readonly createdAt: Date;

  private updatedAtValue: Date;

  private deletedAtValue?: Date;

  protected constructor(createdAt: Date, updatedAt: Date, deletedAt?: Date) {
    this.createdAt = createdAt;
    this.updatedAtValue = updatedAt;
    this.deletedAtValue = deletedAt;
  }

  get updatedAt(): Date {
    return this.updatedAtValue;
  }

  get deletedAt(): Date | undefined {
    return this.deletedAtValue;
  }

  protected updateTimestamp(): void {
    this.updatedAtValue = new Date();
  }

  protected deactivate(): void {
    this.deletedAtValue = new Date();
  }
}
