import UUID from '../../../src/common/uuid';
import { Repository } from '../repository';
import Todo from '../todo';

const sampleTodos = [
  Todo.new('買い物', '牛乳と卵を買う', new Date(2025, 1, 1)),
  Todo.new(
    'レポート作成',
    '第3四半期の売上レポートを作成する',
    new Date(2025, 1, 5),
  ),
  Todo.new('歯医者予約', '定期検診の予約を入れる'),
  Todo.new('図書館', '借りた本を返却する', new Date(2025, 1, 3)),
  Todo.new('ジム', '週末のヨガクラスに参加する', new Date(2025, 1, 6)),
];

export default class MockTodoRepository implements Repository {
  private todos: Map<string, Todo> = new Map();

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    sampleTodos.forEach((todo) => {
      this.todos.set(todo.todoId.toString(), todo);
    });
  }

  async createTodo(todo: Todo): Promise<Todo> {
    const todoId = todo.todoId.toString();
    if (this.todos.has(todoId)) {
      throw new Error(`Todo with id ${todoId} already exists`);
    }
    this.todos.set(todoId, todo);
    return Promise.resolve(todo);
  }

  async getTodoList(): Promise<Todo[]> {
    return Promise.resolve(Array.from(this.todos.values()));
  }

  async getTodo(id: UUID): Promise<Todo> {
    const todo = this.todos.get(id.toString());
    if (!todo) {
      throw new Error(`Todo with id ${id.toString()} not found`);
    }
    return Promise.resolve(todo);
  }

  async updateTodo(todo: Todo): Promise<Todo> {
    const todoId = todo.todoId.toString();
    if (!this.todos.has(todoId)) throw new Error(`Todo with id ${todoId} not found`);

    this.todos.set(todoId, todo);
    return Promise.resolve(todo);
  }

  async deleteTodo(id: UUID): Promise<void> {
    const todoId = id.toString();
    if (!this.todos.has(todoId)) {
      throw new Error(`Todo with id ${todoId} not found`);
    }
    this.todos.delete(todoId);
    return Promise.resolve();
  }
}
