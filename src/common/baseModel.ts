export default class BaseModel {
  public readonly createdAt: Date;

  protected updatedAtValue: Date;

  protected constructor(createdAt: Date, updatedAt: Date) {
    this.createdAt = createdAt;
    this.updatedAtValue = updatedAt;
  }

  get updatedAt(): Date {
    return this.updatedAtValue;
  }

  protected updateTimestamp(): void {
    this.updatedAtValue = new Date();
  }
}
