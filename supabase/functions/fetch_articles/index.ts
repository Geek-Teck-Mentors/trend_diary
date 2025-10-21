import { Hono } from "jsr:@hono/hono";
import { QiitaFetcher } from "./fetcher/qiita_fetcher.ts";
import { ZennFetcher } from "./fetcher/zenn_fetcher.ts";
import { ExecutorImpl } from "./executor.ts";
import ArticleRepositoryImpl from "./repository.ts";
import { rdbClient } from "../../infrastructure/supabase_client.ts";
import { logger } from "../../logger/logger.ts";
// functionNameはsupabase functionsの名前に一致させないとsupabaseがリクエストを振り分けない
const functionName = "fetch_articles";
export const app = new Hono().basePath(`/${functionName}`);

app.post("/articles/qiita", async (c) => {
  logger.info("Request to fetch Qiita articles");
  try {
    const fetcher = new QiitaFetcher();
    const repository = new ArticleRepositoryImpl(rdbClient);

    const exec = new ExecutorImpl("qiita", fetcher, repository);
    const { data, error } = await exec.do();
    if (error) {
      logger.error(error.name, error.message);
      return c.json({ message: "internal server error" }, 500);
    }
    return c.json({ message: data.message }, 201);
  } catch (error) {
    logger.error("unknown error", error);
    return c.json({ message: "unknown error" }, 500);
  }
});

app.post("/articles/zenn", async (c) => {
  logger.info("Request to fetch Zenn articles");
  try {
    const fetcher = new ZennFetcher();
    const repository = new ArticleRepositoryImpl(rdbClient);

    const exec = new ExecutorImpl("zenn", fetcher, repository);
    const { data, error } = await exec.do();
    if (error) {
      logger.error(error.name, error.message);
      return c.json({ message: "internal server error" }, 500);
    }
    return c.json({ message: data.message }, 201);
  } catch (error) {
    logger.error("unknown error", error);
    return c.json({ message: "unknown error" }, 500);
  }
});

Deno.serve(app.fetch);
