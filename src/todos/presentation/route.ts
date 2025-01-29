import { Hono } from "hono";
import { TodoHandlerFactory } from "./handler";
import { MockTodoRepository } from "../repository/mock";

const handlerFactory = new TodoHandlerFactory(new MockTodoRepository());
const handlers = handlerFactory.createHandlers();

const app = new Hono();

app.get("/", handlers.getList);
app.get("/:id", handlers.getOne);
app.post("/", handlers.create);
app.patch("/:id", handlers.update);
app.delete("/:id", handlers.delete);

export { app as todoApp };
