import { type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import React, { useState } from 'react';
import { hc } from 'hono/client';
import apiApp from '../../api.route';
import Todo from '../../../examples/todos/todo';
import TodoList from '../../../examples/todos/presentation/TodoList';

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
    return new Response(
      JSON.stringify({
        todos: initialData,
        baseUrl: new URL(request.url).origin,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error loading todos:', error);
    return new Response(
      JSON.stringify({
        todos: [] as TodoData[],
        error: 'Failed to load todos',
        baseUrl: new URL(request.url).origin,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }
};

// ローダーの型定義
type LoaderData = {
  todos: TodoData[];
  baseUrl: string;
  error?: string;
};

export default function TodoListRemix() {
  const { todos: initialData, baseUrl } = useLoaderData<typeof loader>() as LoaderData;
  // 初回データはサーバーサイドから取得済み
  const [todos, setTodos] = useState<Todo[]>(initialData.map((v: TodoData) => Todo.fromJSON(v)));
  const [loading, setLoading] = useState(false);

  // 新しいTodoを追加する関数
  const addTodo = async () => {
    setLoading(true);

    try {
      // 必要なときにのみクライアントを作成して使用
      const client = hc<typeof apiApp>(`${baseUrl}/api`);

      const res = await client.todos.$post({
        json: {
          title: '新しいTodoアイテム',
          description: '説明文',
        },
      });

      const data = await res.json();
      const todoData = data as TodoData;
      const newTodo = Todo.fromJSON(todoData);
      setTodos((prevTodos) => [...prevTodos, newTodo]);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Todoの追加中にエラーが発生しました:', err);
    } finally {
      setLoading(false);
    }
  };

  return <TodoList loading={loading} todos={todos} addTodo={addTodo} />;
}
