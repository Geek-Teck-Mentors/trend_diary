import { BaseRssFetcher } from "./base_fetcher.ts";
import type { FeedItem, ZennItem } from "../model/types.ts";

export class ZennFetcher extends BaseRssFetcher<ZennItem> {
  url = "https://zenn.dev/feed";
  protected mediaName = "Zenn";

  protected mapToFeedItem(item: ZennItem): FeedItem {
    return {
      title: item.title,
      author: item.creator,
      description: item.content,
      url: item.link,
    };
  }
}
