import {
  failure,
  isFailure,
  success,
  wrapAsyncCall,
} from "@yuukihayashi0510/core";
import { logger } from "../../../logger/logger.ts";
import { MediaFetchError } from "../error.ts";
import { fetchRssFeed } from "./fetch.ts";
import { ArticleFetcher } from "../model/interface.ts";
import type { ZennItem } from "../model/types.ts";

export class ZennFetcher implements ArticleFetcher {
  url = "https://zenn.dev/feed";
  async fetch() {
    const feedItemsResult = await wrapAsyncCall(() =>
      fetchRssFeed<ZennItem>(this.url)
    );

    if (isFailure(feedItemsResult)) {
      logger.error("Error fetching Zenn feed:", feedItemsResult.error);
      const message = `Failed to fetch Zenn feed: ${feedItemsResult.error}`;
      return failure(new MediaFetchError(message));
    }

    return success(
      feedItemsResult.data.map((item) => ({
        title: item.title,
        author: item.creator,
        description: item.content,
        url: item.link,
      })),
    );
  }
}
