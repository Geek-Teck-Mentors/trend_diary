import { Todo } from "./todo";
import { Repository } from "./repository";
import { UUID } from "../common/uuid";

export class TodoService {
  constructor(private repository: Repository) {}

  createTodo(title: string, description?: string, dueDate?: Date): Todo {
    const todo = Todo.new(title, description, dueDate);
    return this.repository.createTodo(todo);
  }

  getTodoList(): Todo[] {
    return this.repository.getTodoList();
  }

  getTodo(id: UUID): Todo {
    return this.repository.getTodo(id);
  }

  updateTodo(todo: Todo): Todo {
    return this.repository.updateTodo(todo);
  }

  deleteTodo(id: UUID): void {
    this.repository.deleteTodo(id);
  }

  markAsComplete(id: UUID): Todo {
    const todo = this.getTodo(id);
    todo.toggleComplete();
    return this.updateTodo(todo);
  }

  getOverdueTodos(): Todo[] {
    return this.getTodoList().filter((todo) => todo.isOverdue());
  }
}
