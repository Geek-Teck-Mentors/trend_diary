import { hc } from "hono/client";
import { apiApp } from "../../api.route";
import { Todo } from "../todo";
import { useEffect, useState } from "hono/jsx";

export const TodoListPage = () => {
  const client = hc<typeof apiApp>("/api");
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    const f = async () => {
      const res = await client.todos.$get();
      console.log((await res.json()).map((v) => v));
    };
    f();
  }, []);

  return (
    <div>
      <h1>Todoリスト</h1>
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
