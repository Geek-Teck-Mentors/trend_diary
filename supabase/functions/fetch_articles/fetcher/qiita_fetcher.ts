import { logger } from "../../../logger/logger.ts";
import { MediaFetchError } from "../error.ts";
import { ArticleFetcher } from "../model/interface.ts";
import { resultError, resultSuccess } from "../model/result.ts";
import { FeedItem, QiitaItem } from "../model/types.ts";
import { fetchRssFeed } from "./fetch.ts";

export class QiitaFetcher implements ArticleFetcher {
  url = "https://qiita.com/popular-items/feed.atom";

  async fetch() {
    try {
      const feedItems = await fetchRssFeed<QiitaItem>(this.url);
      let params: FeedItem[] = [];

      params = feedItems.map((item) => ({
        title: item.title,
        author: item.author,
        description: item.content,
        url: item.link,
      }));

      return resultSuccess(params);
    } catch (error: unknown) {
      logger.error("Error fetching Qiita feed:", error);
      const message = `Failed to fetch Qiita feed: ${error}`;
      return resultError<FeedItem[], MediaFetchError>(
        new MediaFetchError(message),
      );
    }
  }
}
