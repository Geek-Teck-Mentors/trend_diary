import { MediaFetchError } from "../error.ts";
import { ArticleFetcher } from "../model/interface.ts";
import { FeedItem, ZennItem } from "../model/types.ts";
import { fetchRssFeed } from "./fetch.ts";

export class ZennFetcher implements ArticleFetcher {
  url = "https://zenn.dev/feed";
  async fetch() {
    try {
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
    } catch (error: unknown) {
      console.error("Error processing feed items:", error);
      throw new MediaFetchError("Failed to process feed items: " + error);
    }
  }
}
