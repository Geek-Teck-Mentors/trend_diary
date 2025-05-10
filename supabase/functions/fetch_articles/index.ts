import { Hono } from "jsr:@hono/hono";
import { QiitaFetcher } from "./fetcher/qiita_fetcher.ts";
import { ZennFetcher } from "./fetcher/zenn_fetcher.ts";
import { Executor } from "./executor.ts";
import ArticleRepositoryImpl from "./repository.ts";
import { InternalServerError } from "./error.ts";
import { rdbClient } from "../infrastructure/supabase_client.ts";

// functionNameはsupabase functionsの名前に一致させないとsupabaseがリクエストを振り分けない
const functionName = "fetch_articles";
const app = new Hono().basePath(`/${functionName}`);

app.post("/articles/qiita", async (c) => {
  try {
    const fetcher = new QiitaFetcher();
    const repository = new ArticleRepositoryImpl(rdbClient);

    const exec = new Executor("qiita", fetcher, repository);
    const res = await exec.do();
    return c.json(res, 201);
  } catch (error) {
    if (error instanceof InternalServerError) {
      return c.json({ message: "internal server error" }, 500);
    } else {
      console.error("Unknown error", error);
      return c.json({ message: "unknown error" }, 500);
    }
  }
});

app.post("/articles/zenn", async (c) => {
  try {
    const fetcher = new ZennFetcher();
    const repository = new ArticleRepositoryImpl(rdbClient);

    const exec = new Executor("zenn", fetcher, repository);
    const res = await exec.do();
    return c.json(res, 201);
  } catch (error) {
    if (error instanceof InternalServerError) {
      return c.json({ message: "internal server error" }, 500);
    } else {
      console.error("Error", error);
      return c.json({ message: "unknown error" }, 500);
    }
  }
});

Deno.serve(app.fetch);
