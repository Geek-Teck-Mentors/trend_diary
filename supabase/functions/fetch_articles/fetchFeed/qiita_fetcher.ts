import { FeedItem } from "./types.ts";
import { ArticleFetcher, QiitaItem } from "./types.ts";
import { fetchRssFeed } from "./utils.ts";

export class QiitaFetcher implements ArticleFetcher {
  url = "https://qiita.com/popular-items/feed.atom";

  async fetch() {
    const feedItems = await fetchRssFeed<QiitaItem>(this.url);
    let params: FeedItem[] = [];

    params = feedItems.map((item) => ({
      title: item.title,
      author: item.author,
      description: item.content,
      url: item.link,
    }));

    return params;
  }
}
