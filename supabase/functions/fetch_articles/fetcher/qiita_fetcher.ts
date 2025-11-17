import { logger } from "../../../logger/logger.ts";
import { MediaFetchError } from "../error.ts";
import { ArticleFetcher } from "../model/interface.ts";
import { failure, success, wrapAsyncCall, isFailure } from "@yuukihayashi0510/core";
import { FeedItem, QiitaItem } from "../model/types.ts";
import { fetchRssFeed } from "./fetch.ts";

export class QiitaFetcher implements ArticleFetcher {
  url = "https://qiita.com/popular-items/feed.atom";

  async fetch() {
    const feedItemsResult = await wrapAsyncCall(() => fetchRssFeed<QiitaItem>(this.url));

    if (isFailure(feedItemsResult)) {
      logger.error("Error fetching Qiita feed:", feedItemsResult.error);
      const message = `Failed to fetch Qiita feed: ${feedItemsResult.error}`;
      return failure(new MediaFetchError(message));
    }

    const feedItems = feedItemsResult.data;
    const params: FeedItem[] = feedItems.map((item) => ({
      title: item.title,
      author: item.author,
      description: item.content,
      url: item.link,
    }));

    return success(params);
  }
}
