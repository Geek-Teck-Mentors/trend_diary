import { todoSchema, TodoInput } from './schema';
import UUID from '../../src/common/uuid';
import { UndefinedOr } from '../../src/common/typeUtility';
import BaseModel from '../../src/common/baseModel';

export default class Todo extends BaseModel {
  private constructor(
    private readonly todoIdValue: UUID,
    private titleValue: string,
    private descriptionValue?: string,
    private completedValue: boolean = false,
    private dueDateValue?: Date,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
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
      now,
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
      data.updatedAt ? new Date(data.updatedAt) : undefined,
    );
  }

  get todoId(): UUID {
    return this.todoIdValue;
  }

  get title(): string {
    return this.titleValue;
  }

  set title(value: string) {
    this.titleValue = todoSchema.shape.title.parse(value);
    this.updateTimestamp();
  }

  get description(): UndefinedOr<string> {
    return this.descriptionValue;
  }

  set description(value: UndefinedOr<string>) {
    this.descriptionValue = todoSchema.shape.description.parse(value);
    this.updateTimestamp();
  }

  get completed(): boolean {
    return this.completedValue;
  }

  get dueDate(): UndefinedOr<Date> {
    return this.dueDateValue;
  }

  set dueDate(value: UndefinedOr<Date>) {
    if (value && value < new Date()) {
      throw new Error('Due date cannot be in the past');
    }
    this.dueDateValue = todoSchema.shape.dueDate.parse(value);
    this.updateTimestamp();
  }

  toggleComplete(): void {
    this.completedValue = !this.completedValue;
    this.updateTimestamp();
  }

  isOverdue(): boolean {
    if (!this.dueDateValue || this.completedValue) return false;
    return this.dueDateValue < new Date();
  }

  toJSON(): TodoInput {
    return {
      todoId: this.todoIdValue.toString(),
      title: this.titleValue,
      description: this.descriptionValue,
      completed: this.completedValue,
      dueDate: this.dueDateValue?.toString(),
      createdAt: this.createdAt.toString(),
      updatedAt: this.updatedAt.toString(),
    };
  }
}
