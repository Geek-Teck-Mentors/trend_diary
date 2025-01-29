import { Hono } from "hono";
import { timeout } from "hono/timeout";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler } from "./middleware/errorHandler";
import { renderer } from "./renderer";
import { apiApp } from "./api.route";
import { Env } from "./env";
import { TodoListPage } from "./todos/presentation/TodoListPage";

const app = new Hono<Env>();

app.use(requestLogger);
app.onError(errorHandler);

// apiの登録
app.use("/api", timeout(5000));
app.route("/api", apiApp);

app.use(renderer);

app.get("/", (c) => {
  return c.render(<h1>Hello!</h1>);
});

app.get("/todos", async (c) => {
  // サーバ2サーバでAPIエンドポイントのtodosを取得するか、同じロジック使うしかなさそう。
  const res = await fetch("http://localhost:5173/api/todos");
  const todos = await res.json();

  return c.render(<TodoListPage todos={todos} />);
});

export default app;
