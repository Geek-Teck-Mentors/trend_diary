import { BaseRssFetcher } from "./base_fetcher.ts";
import type { FeedItem, QiitaItem } from "../model/types.ts";

export class QiitaFetcher extends BaseRssFetcher<QiitaItem> {
  url = "https://qiita.com/popular-items/feed.atom";
  protected mediaName = "Qiita";

  protected mapToFeedItem(item: QiitaItem): FeedItem {
    return {
      title: item.title,
      author: item.author,
      description: item.content,
      url: item.link,
    };
  }
}
