import { Hono } from "hono";
// TODO: 検証終わり次第、importを消す
import { todoApp } from "../examples/todos/presentation/route";

const app = new Hono().route("/todos", todoApp);

export { app as apiApp };
