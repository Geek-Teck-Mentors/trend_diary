import { ArticleFetcher, FeedItem, ZennItem } from "./types.ts";
import { fetchRssFeed } from "./utils.ts";

export class ZennFetcher implements ArticleFetcher {
  url = "https://zenn.dev/feed";
  async fetch() {
    const feedItems = await fetchRssFeed<ZennItem>(this.url);
    let params: FeedItem[] = [];

    params = feedItems.map((item) => ({
      media: "zenn",
      title: item.title,
      author: item.creator,
      description: item.content,
      url: item.link,
    }));

    return params;
  }
}
