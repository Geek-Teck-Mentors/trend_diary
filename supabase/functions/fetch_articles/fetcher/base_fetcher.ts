import type { Result } from "@yuukihayashi0510/core";
import {
  failure,
  isFailure,
  success,
  wrapAsyncCall,
} from "@yuukihayashi0510/core";
import { logger } from "../../../logger/logger.ts";
import { MediaFetchError } from "../error.ts";
import { fetchRssFeed } from "./fetch.ts";
import type { ArticleFetcher } from "../model/interface.ts";
import type { FeedItem } from "../model/types.ts";

export abstract class BaseRssFetcher<T> implements ArticleFetcher {
  abstract url: string;
  protected abstract mediaName: string;
  protected abstract mapToFeedItem(item: T): FeedItem;

  async fetch(): Promise<Result<FeedItem[], MediaFetchError>> {
    const feedItemsResult = await wrapAsyncCall(() =>
      fetchRssFeed<T>(this.url)
    );

    if (isFailure(feedItemsResult)) {
      logger.error(
        `Error fetching ${this.mediaName} feed:`,
        feedItemsResult.error,
      );
      const message = `Failed to fetch ${this.mediaName} feed`;
      return failure(new MediaFetchError(message));
    }

    return success(
      feedItemsResult.data.map((item) => this.mapToFeedItem(item)),
    );
  }
}
