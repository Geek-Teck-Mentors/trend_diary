import { Hono } from "hono";
import { TodoHandlerFactory } from "./handler";
import { MockTodoRepository } from "../repository/mock";
import { TodoService } from "../service";

const handlerFactory = new TodoHandlerFactory(
  new TodoService(new MockTodoRepository())
);
const handlers = handlerFactory.createHandlers();

const app = new Hono()
  .get("/", handlers.getList)
  .get("/:id", handlers.getOne)
  .post("/", handlers.create)
  .patch("/:id", handlers.update)
  .delete("/:id", handlers.delete);

export { app as todoApp };
