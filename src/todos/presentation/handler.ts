import { Hono } from "hono";
import { TodoService } from "../service";
import { MockTodoRepository } from "../repository/mock";
import { UUID } from "../../common/uuid";
import { todoSchema } from "../schema";

const app = new Hono();

app.get("/", async (c) => {
  const service = new TodoService(new MockTodoRepository());

  const todoList = await service.getTodoList();

  return c.json(
    todoList.map((v) => v.toJSON()),
    200
  );
});

app.get("/:id", async (c) => {
  const { id } = c.req.param();

  const valResult = todoSchema.pick({ todoId: true }).safeParse({ todoId: id });
  if (!valResult.data) throw new Error(valResult.error.toString());

  const service = new TodoService(new MockTodoRepository());

  const todo = await service.getTodo(UUID.fromString(id));

  return c.json(todo.toJSON(), 200);
});

app.post("/", async (c) => {
  const body = await c.req.json();

  const valResult = todoSchema
    .pick({ title: true, description: true, dueDate: true })
    .safeParse(body);
  if (!valResult.data) throw new Error(valResult.error.toString());

  const data = valResult.data;

  const service = new TodoService(new MockTodoRepository());

  const todo = await service.createTodo(
    data.title,
    data.description,
    data.dueDate
  );

  return c.json(todo.toJSON(), 200);
});

app.patch("/:id", async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();

  const valResult = todoSchema
    .pick({
      todoId: true,
      title: true,
      description: true,
      completed: true,
      dueDate: true,
    })
    .safeParse({ ...body, todoId: id });
  if (!valResult.data) throw new Error(valResult.error.toString());

  const service = new TodoService(new MockTodoRepository());

  const todo = await service.updateTodo(valResult.data);

  return c.json(todo.toJSON(), 200);
});

app.delete("/:id", async (c) => {
  const { id } = c.req.param();

  const valResult = todoSchema.pick({ todoId: true }).safeParse(id);
  if (!valResult.data) throw new Error(valResult.error.toString());

  const service = new TodoService(new MockTodoRepository());

  await service.deleteTodo(UUID.fromString(valResult.data.todoId));

  return c.status(204);
});

export { app as todoApp };
