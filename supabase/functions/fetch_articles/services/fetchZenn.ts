import fetchFeed from "./fetchFeed.ts";

const FEED_URL =  "https://zenn.dev/feed";

export default async () => {
  const feed = await fetchFeed(FEED_URL);
  return feed;
};
