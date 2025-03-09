import { UUID } from "../../src/common/uuid";
import { Todo } from "./todo";

export interface Repository {
  createTodo(todo: Todo): Promise<Todo>;
  getTodoList(): Promise<Todo[]>;
  getTodo(id: UUID): Promise<Todo>;
  updateTodo(todo: Todo): Promise<Todo>;
  deleteTodo(id: UUID): Promise<void>;
}
