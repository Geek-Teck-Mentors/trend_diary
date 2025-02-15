import { hc } from "hono/client";
import { apiApp } from "../../../src/api.route";
import { useState } from "hono/jsx";
import { Todo } from "../todo";

export const TodoListPage = async () => {
  // 初期データの取得
  const client = hc<typeof apiApp>("http://localhost:5173/api");
  const res = await client.todos.$get();
  const initialData = await res.json();

  // useStateの初期値として使用
  const [todos, setTodos] = useState<Todo[]>(
    initialData.map((v) => Todo.fromJSON(v))
  );
  const [loading, setLoading] = useState(false);

  // 新しいTodoを追加する関数
  const addTodo = async () => {
    setLoading(true);
    try {
      const res = await client.todos.$post({
        json: {
          title: "新しいTodo",
          description: "説明",
        },
      });
      const newTodo = Todo.fromJSON(await res.json());
      setTodos((v) => [...v, newTodo]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Todoリスト</h1>
      <button onClick={addTodo} disabled={loading}>
        {loading ? "追加中..." : "新しいTodoを追加"}
      </button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.todoId}>
            <div>{todo.title}</div>
            <div>{todo.description}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};
