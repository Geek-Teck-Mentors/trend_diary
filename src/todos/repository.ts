import { UUID } from "../common/uuid";
import { Todo } from "./todo";

export abstract class Repository {
  abstract createTodo(todo: Todo): Todo;
  abstract getTodoList(): Todo[];
  abstract getTodo(id: UUID): Todo;
  abstract updateTodo(todo: Todo): Todo;
  abstract deleteTodo(id: UUID): void;
}
