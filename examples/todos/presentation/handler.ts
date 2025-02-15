import { Context, Hono } from "hono";
import { TodoService } from "../service";
import { UUID } from "../../../src/common/uuid";
import { todoSchema } from "../schema";
import { HTTPException } from "hono/http-exception";
import { Repository } from "../repository";

// Factoryパターン参考：https://hono.dev/docs/guides/best-practices#factory-createhandlers-in-hono-factory
export class TodoHandlerFactory {
  constructor(private readonly todoService: TodoService) {}

  createHandlers() {
    return {
      getList: async (c: Context) => {
        const todoList = await this.todoService.getTodoList();
        return c.json(
          todoList.map((v) => v.toJSON()),
          200
        );
      },

      getOne: async (c: Context) => {
        const { id } = c.req.param();
        const valResult = todoSchema
          .pick({ todoId: true })
          .safeParse({ todoId: id });
        if (!valResult.success) {
          throw new HTTPException(400, { message: valResult.error.toString() });
        }

        const todo = await this.todoService.getTodo(UUID.fromString(id));
        return c.json(todo.toJSON(), 200);
      },

      create: async (c: Context) => {
        const body = await c.req.json();
        const valResult = todoSchema
          .pick({ title: true, description: true, dueDate: true })
          .safeParse(body);
        if (!valResult.success) {
          throw new HTTPException(400, { message: valResult.error.toString() });
        }

        const data = valResult.data;
        const todo = await this.todoService.createTodo(
          data.title,
          data.description,
          data.dueDate
        );
        return c.json(todo.toJSON(), 200);
      },

      update: async (c: Context) => {
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
        if (!valResult.success) {
          throw new HTTPException(400, { message: valResult.error.toString() });
        }

        const todo = await this.todoService.updateTodo(valResult.data);
        return c.json(todo.toJSON(), 200);
      },

      delete: async (c: Context) => {
        const { id } = c.req.param();
        const valResult = todoSchema
          .pick({ todoId: true })
          .safeParse({ todoId: id });
        if (!valResult.success) {
          throw new HTTPException(400, { message: valResult.error.toString() });
        }

        await this.todoService.deleteTodo(
          UUID.fromString(valResult.data.todoId)
        );
        return new Response(null, { status: 204 });
      },
    };
  }
}
