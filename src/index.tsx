import { Hono } from "hono";
import { timeout } from "hono/timeout";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler } from "./middleware/errorHandler";
import { renderer } from "./renderer";
import { apiApp } from "./api.route";
import { Env } from "./env";

const app = new Hono<Env>();

app.use(requestLogger);
app.onError(errorHandler);

// apiの登録
app.route("/api", apiApp);
app.use("/api", timeout(5000));

app.use(renderer);

app.get("/", (c) => {
  return c.render(<h1>Hello!</h1>);
});

export default app;
