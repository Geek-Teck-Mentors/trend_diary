import { parseFeed } from "jsr:@mikaelporttila/rss@*";

export default async (url: string) => {
  const feedUrl = new URL(url);

  const res = await fetch(feedUrl);

  if (!res.ok) {
    throw new Error(`Failed to fetch articles: ${res.statusText}`);
  }

  const xml = await res.text();

  const feed = await parseFeed(xml);

  return feed;
};
