import { Hono } from "jsr:@hono/hono";
import { QiitaFetcher } from "./fetchFeed/qiita_fetcher.ts";
import { ZennFetcher } from "./fetchFeed/zenn_fetcher.ts";

// functionNameはsupabase functionsの名前に一致させないとsupabaseがリクエストを振り分けない
const functionName = "fetch_articles";
const app = new Hono().basePath(`/${functionName}`);

app.post("/articles/qiita", async (c) => {
  try {
    const fetcher = new QiitaFetcher();
    const items = await fetcher.fetch();
    return c.json({ status: "ok", message: "successfully fetched articles", items }, 200)
  } catch (error) {
    if (error instanceof Error) {
      return c.json(
        { status: "unknown error", message: error.message },
        500,
      );
    }
  }
});

app.post("/articles/zenn", async (c) => {
  try {
    const fetcher = new ZennFetcher();
    const items = await fetcher.fetch();
    return c.json({ status: "ok", message: "successfully fetched articles", items }, 200)
  } catch (error) {
    if (error instanceof Error) {
      return c.json(
        { status: "unknown error", message: error.message },
        500,
      );
    }
  }
});

Deno.serve(app.fetch);
