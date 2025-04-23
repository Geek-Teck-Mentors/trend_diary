import { parseFeed } from "jsr:@mikaelporttila/rss@*";

const QIITA_RUL =  "https://qiita.com/popular-items/feed.atom"
const ZENN_URL =  "https://zenn.dev/feed";

const fetchFeed = async (url: string) => {
  const feedUrl = new URL(url);

  const res = await fetch(feedUrl);

  if (!res.ok) {
    throw new Error(`Failed to fetch articles: ${res.statusText}`);
  }

  const xml = await res.text();

  const feed = await parseFeed(xml);

  return feed;
};

export const fetchQiitaFeed = async () => {
  const feed = await fetchFeed(QIITA_RUL);
  return feed;
}

export const fetchZennFeed = async () => {
  const feed = await fetchFeed(ZENN_URL);
  return feed;
}
