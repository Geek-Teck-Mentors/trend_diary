import fetchFeed from "./fetchFeed.ts";

const FEED_URL =  "https://qiita.com/popular-items/feed.atom"

export default async () => {
  const feed = await fetchFeed(FEED_URL);
  return feed;
};
