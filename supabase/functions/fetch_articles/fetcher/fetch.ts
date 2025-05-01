import Parser from "npm:rss-parser@3.13.0";

export async function fetchRssFeed<T>(url: string): Promise<T[]> {
  const parser = new Parser<{ items: T[] }, T>();
  const feed = await parser.parseURL(url);
  return feed.items;
}
