import { todoSchema, TodoInput } from "./schema";
import { UUID } from "../common/uuid";
import { UndefinedOr } from "../common/typeUtility";
import { BaseModel } from "../common/baseModel";

export class Todo extends BaseModel {
  private constructor(
    private readonly _todoId: UUID,
    private _title: string,
    private _description?: string,
    private _completed: boolean = false,
    private _dueDate?: Date,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    super(createdAt, updatedAt);
  }

  static new(title: string, description?: string, dueDate?: Date): Todo {
    const now = new Date();
    const parsedTitle = todoSchema.shape.title.parse(title);
    const parsedDescription = todoSchema.shape.description.parse(description);
    const parsedDueDate = todoSchema.shape.dueDate.parse(dueDate);

    return new this(
      UUID.new(),
      parsedTitle,
      parsedDescription,
      false,
      parsedDueDate,
      now,
      now
    );
  }

  static fromJSON(data: TodoInput): Todo {
    return new this(
      UUID.fromString(data.todoId),
      data.title,
      data.description,
      data.completed,
      data.dueDate ? new Date(data.dueDate) : undefined,
      data.createdAt ? new Date(data.createdAt) : undefined,
      data.updatedAt ? new Date(data.updatedAt) : undefined
    );
  }

  get todoId(): UUID {
    return this._todoId;
  }
  get title(): string {
    return this._title;
  }
  get description(): UndefinedOr<string> {
    return this._description;
  }
  get completed(): boolean {
    return this._completed;
  }
  get dueDate(): UndefinedOr<Date> {
    return this._dueDate;
  }

  set title(value: string) {
    this._title = todoSchema.shape.title.parse(value);
    this.updateTimestamp();
  }

  set description(value: UndefinedOr<string>) {
    this._description = todoSchema.shape.description.parse(value);
    this.updateTimestamp();
  }

  set dueDate(value: UndefinedOr<Date>) {
    if (value && value < new Date()) {
      throw new Error("Due date cannot be in the past");
    }
    this._dueDate = todoSchema.shape.dueDate.parse(value);
    this.updateTimestamp();
  }

  toggleComplete(): void {
    this._completed = !this._completed;
    this.updateTimestamp();
  }

  isOverdue(): boolean {
    if (!this._dueDate || this._completed) return false;
    return this._dueDate < new Date();
  }

  toJSON(): TodoInput {
    return {
      todoId: this._todoId.toString(),
      title: this._title,
      description: this._description,
      completed: this._completed,
      dueDate: this._dueDate?.toString(),
      createdAt: this.createdAt.toString(),
      updatedAt: this.updatedAt.toString(),
    };
  }
}
