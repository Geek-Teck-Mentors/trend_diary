import { Hono } from "hono";
import { todoApp } from "./todos/presentation/handler";

const app = new Hono();

app.route("/todos", todoApp);

export { app as apiApp };
