export class BaseModel {
  public readonly createdAt: Date;
  protected _updatedAt: Date;

  protected constructor(createdAt: Date, updatedAt: Date) {
    this.createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  protected updateTimestamp(): void {
    this._updatedAt = new Date();
  }
}
