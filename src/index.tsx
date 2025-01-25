import { Hono } from "hono";
import { renderer } from "./renderer";
import { apiApp } from "./api.route";
import { logger } from "hono/logger";
import { timeout } from "hono/timeout";

const app = new Hono();

app.use(logger());

// apiの登録
app.route("/api", apiApp);
app.use("/api", timeout(5000));

app.use(renderer);

app.get("/", (c) => {
  return c.render(<h1>Hello!</h1>);
});

export default app;
