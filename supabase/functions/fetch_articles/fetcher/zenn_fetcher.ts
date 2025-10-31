import { logger } from "../../../logger/logger.ts";
import { MediaFetchError } from "../error.ts";
import { ArticleFetcher } from "../model/interface.ts";
import { failure, success } from "@yuukihayashi0510/core";
import { FeedItem, ZennItem } from "../model/types.ts";
import { fetchRssFeed } from "./fetch.ts";

export class ZennFetcher implements ArticleFetcher {
  url = "https://zenn.dev/feed";
  async fetch() {
    try {
      const feedItems = await fetchRssFeed<ZennItem>(this.url);
      let params: FeedItem[] = [];

      params = feedItems.map((item) => ({
        title: item.title,
        author: item.creator,
        description: item.content,
        url: item.link,
      }));

      return success(params);
    } catch (error: unknown) {
      logger.error("Error fetching Zenn feed:", error);
      const message = `Failed to fetch Zenn feed: ${error}`;
      return failure(
        new MediaFetchError(message),
      );
    }
  }
}
