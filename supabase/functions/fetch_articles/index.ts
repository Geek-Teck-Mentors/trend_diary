import { Hono } from "jsr:@hono/hono";
import fetchFeed from "./fetchFeed/index.ts";
import { DataFetchError } from "./repository/error.ts";
import { RssParserError } from "./fetchFeed/error.ts";

// supabase edge functionのためにedge functionsの名前を指定
const functionName = "fetch_articles";
const app = new Hono().basePath(`/${functionName}`);

app.post("/articles/:media", async (c) => {
  const media = c.req.param("media");
  try {
    if (media === "qiita" || media === "zenn") {
      const items = await fetchFeed(media);
      return c.json(
        { status: "ok", data: items },
        200,
      );
    } else {
      return c.json(
        { status: "error", message: "Invalid media type" },
        400,
      );
    }
  } catch (error) {
    if (error instanceof DataFetchError) {
      return c.json(
        { status: "data fetch error", message: error.message },
        500,
      );
    } else if (error instanceof RssParserError) {
      return c.json(
        { status: "rss parser error", message: error.message },
        500,
      );
    } else if (error instanceof Error) {
      return c.json(
        { status: "unknown error", message: error.message },
        500,
      );
    }
  }
});

Deno.serve(app.fetch);
