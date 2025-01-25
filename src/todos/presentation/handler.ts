import { Hono } from "hono";
import { TodoService } from "../service";
import { MockTodoRepository } from "../repository/mock";
import { UUID } from "../../common/uuid";
import { todoSchema } from "../schema";

const app = new Hono();

app.get("/", (c) => {
  const service = new TodoService(new MockTodoRepository());

  const todoList = service.getTodoList();

  return c.json(
    todoList.map((v) => v.toJSON()),
    200
  );
});

app.get("/:id", (c) => {
  const { id } = c.req.param();

  const service = new TodoService(new MockTodoRepository());

  const todo = service.getTodo(UUID.fromString(id));

  return c.json(todo.toJSON(), 200);
});

app.post("/", async (c) => {
  const body = await c.req.json();

  const data = todoSchema
    .pick({ title: true, description: true, dueDate: true })
    .parse(body);

  const service = new TodoService(new MockTodoRepository());

  const todo = service.createTodo(data.title, data.description, data.dueDate);

  return c.json(todo.toJSON(), 200);
});

app.delete("/:id", async (c) => {
  const { id } = c.req.param();

  const data = todoSchema.pick({ todoId: true }).parse(id);

  const service = new TodoService(new MockTodoRepository());

  service.deleteTodo(UUID.fromString(data.todoId));

  return c.status(204);
});

export { app as todoApp };
