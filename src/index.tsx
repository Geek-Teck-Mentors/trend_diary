import { Hono } from "hono";
import { renderer } from "./renderer";
import { apiApp } from "./api.route";
import { timeout } from "hono/timeout";
import { logger } from "./logger/logger";
import { requestLogger } from "./middleware/requestLogger";

type Env = {
  Variables: {
    logger: typeof logger;
  };
};

const app = new Hono<Env>();

app.use(requestLogger);

// apiの登録
app.route("/api", apiApp);
app.use("/api", timeout(5000));

app.use(renderer);

app.get("/", (c) => {
  return c.render(<h1>Hello!</h1>);
});

export default app;
