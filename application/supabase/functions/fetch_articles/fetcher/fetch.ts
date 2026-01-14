import Parser from "npm:rss-parser@3.13.0";
import { logger } from "../../../logger/logger.ts";

export async function fetchRssFeed<T>(url: string): Promise<T[]> {
  logger.info("Fetching RSS feed from URL:", url);
  const parser = new Parser<{ items: T[] }, T>();
  const feed = await parser.parseURL(url);
  logger.info("RSS feed fetched successfully from URL:", url);
  return feed.items;
}
