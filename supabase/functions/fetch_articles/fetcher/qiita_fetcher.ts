import { MediaFetchError } from "../error.ts";
import { ArticleFetcher } from "../model/interface.ts";
import { FeedItem, QiitaItem } from "../model/types.ts";
import { fetchRssFeed } from "./fetch.ts";

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
    } catch (error) {
      console.error("Error processing feed items:", error);
      throw new MediaFetchError("Failed to process feed items: " + error);
    }
  }
}
