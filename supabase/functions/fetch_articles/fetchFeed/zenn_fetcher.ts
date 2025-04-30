import { RssParserError } from "./error.ts";
import { ArticleFetcher, FeedItem, ZennItem } from "./types.ts";
import { fetchRssFeed } from "./utils.ts";

export class ZennFetcher implements ArticleFetcher {
  url = "https://zenn.dev/feed";
  async fetch() {
    const feedItems = await fetchRssFeed<ZennItem>(this.url);
    let params: FeedItem[] = [];

    try {
      params = feedItems.map((item) => ({
        media: "zenn",
        title: item.title,
        author: item.creator,
        description: item.content,
        url: item.link,
      }));

      return params;
    } catch (error) {
      console.error("Error processing feed items:", error);
      throw new RssParserError("Failed to process feed items: " + error);
    }
  }
}
