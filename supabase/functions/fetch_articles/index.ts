import { Hono } from "jsr:@hono/hono";
import fetchFeed from "./fetchFeed/index.ts";
import { SupabaseClientError } from "./repository/error.ts";
import { InvalidMediaError, RssParserError } from "./fetchFeed/error.ts";

const functionName = "fetch_articles";
const app = new Hono().basePath(`/${functionName}`);

app.post("/articles/:media", async (c) => {
  const media = c.req.param("media");
  try {
    await fetchFeed(media);
  } catch (error) {
    if (error instanceof SupabaseClientError) {
      return c.json(
        { status: "supabase client error", message: error.message },
        500,
      );
    } else if (error instanceof InvalidMediaError) {
      return c.json(
        { status: "invalid media error", message: error.message },
        400,
      );
    } else if (error instanceof RssParserError) {
      return c.json(
        { status: "rss parser error", message: error.message },
        500,
      );
    } else if (error instanceof Error) {
      return c.json({ status: "generic error", message: error.message }, 500);
    } else {
      return c.json({
        status: "unknown error",
        message: "An unknown error occurred",
      }, 500);
    }
  }

  return c.json(
    { status: "ok", message: "Articles fetched successfully" },
    200,
  );
});

Deno.serve(app.fetch);
