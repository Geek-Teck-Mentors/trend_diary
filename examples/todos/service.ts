import { Todo } from "./todo";
import { Repository } from "./repository";
import { UUID } from "../../src/common/uuid";
import { UpdateTodoInput } from "./schema";

export class TodoService {
  constructor(private repository: Repository) {}

  createTodo(title: string, description?: string, dueDate?: Date) {
    const todo = Todo.new(title, description, dueDate);
    return this.repository.createTodo(todo);
  }

  getTodoList() {
    return this.repository.getTodoList();
  }

  getTodo(id: UUID) {
    return this.repository.getTodo(id);
  }

  async updateTodo(input: UpdateTodoInput) {
    const todo = await this.repository.getTodo(UUID.fromString(input.todoId));

    todo.title = input.title;
    todo.description = input.description;
    todo.dueDate = input.dueDate;
    if (todo.completed !== input.completed) todo.toggleComplete();

    return this.repository.updateTodo(todo);
  }

  deleteTodo(id: UUID) {
    return this.repository.deleteTodo(id);
  }
}
