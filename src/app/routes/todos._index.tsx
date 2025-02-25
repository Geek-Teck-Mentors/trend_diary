import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { apiApp } from "../../../src/api.route";
import { useState } from "react";
import { hc } from "hono/client";
import { Todo } from "../../../examples/todos/todo";

// APIレスポンスの型定義
interface TodoData {
  todoId: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
}

// サーバーサイドでデータを先に取得
export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const response = await fetch(`${new URL(request.url).origin}/api/todos`);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const initialData = (await response.json()) as TodoData[];
    return json({
      todos: initialData,
      baseUrl: new URL(request.url).origin,
    });
  } catch (error) {
    console.error("Error loading todos:", error);
    return json({
      todos: [] as TodoData[],
      error: "Failed to load todos",
      baseUrl: new URL(request.url).origin,
    });
  }
};

// ローダーの型定義
type LoaderData = {
  todos: TodoData[];
  baseUrl: string;
  error?: string;
};

export default function TodoListRemix() {
  const { todos: initialData, baseUrl } = useLoaderData<
    typeof loader
  >() as LoaderData;
  // 初回データはサーバーサイドから取得済み
  const [todos, setTodos] = useState<Todo[]>(
    initialData.map((v: TodoData) => Todo.fromJSON(v))
  );
  const [loading, setLoading] = useState(false);

  // 新しいTodoを追加する関数
  const addTodo = () => {
    setLoading(true);

    // 必要なときにのみクライアントを作成して使用
    const client = hc<typeof apiApp>(`${baseUrl}/api`);

    client.todos
      .$post({
        json: {
          title: "新しいTodoアイテム",
          description: "説明文",
        },
      })
      .then((res: Response) => res.json())
      // 修正: 型アサーションを追加して型エラーを解消
      .then((data: unknown) => {
        const todoData = data as TodoData;
        const newTodo = Todo.fromJSON(todoData);
        setTodos((v: Todo[]) => [...v, newTodo]);
      })
      .catch((err: Error) => {
        console.error("Error adding todo:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div>
      <h1>Todoリスト</h1>
      <button onClick={addTodo} disabled={loading}>
        {loading ? "追加中..." : "新しいTodoを追加"}
      </button>
      <ul>
        {todos.map((todo: Todo) => (
          <li key={todo.todoId.toString()}>
            <div>{todo.title}</div>
            <div>{todo.description}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
