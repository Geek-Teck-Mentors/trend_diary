import { Hono } from "hono";
import { todoApp } from "./todos/presentation/route";

const app = new Hono().route("/todos", todoApp);

export { app as apiApp };
