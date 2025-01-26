import { UUID } from "../common/uuid";
import { UpdateTodoInput } from "./schema";
import { Todo } from "./todo";

export abstract class Repository {
  abstract createTodo(todo: Todo): Promise<Todo>;
  abstract getTodoList(): Promise<Todo[]>;
  abstract getTodo(id: UUID): Promise<Todo>;
  abstract updateTodo(todo: Todo): Promise<Todo>;
  abstract deleteTodo(id: UUID): Promise<void>;
}
