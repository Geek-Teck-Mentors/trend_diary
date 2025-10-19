import { ArticleFetcher, ArticleRepository } from "./model/interface.ts";
import { ArticleInput } from "./model/model.ts";
import { FeedItem } from "./model/types.ts";

export class Executor {
  constructor(
    private media: string,
    private fetcher: ArticleFetcher,
    private repository: ArticleRepository,
  ) {}

  async do() {
    console.log("Executing fetcher for media:", this.media);
    const fetchedItems = await this.fetcher.fetch();
    if (fetchedItems.length === 0) {
      return { message: "no items" };
    }

    const existingArticles = await this.fetchExistingArticles(fetchedItems);
    const existingUrls = new Set(existingArticles.map((article) => article.url));

    const items = fetchedItems.filter((item) => !existingUrls.has(item.url));

    console.log("Inserting items into repository:", items.length);
    const articles = await this.bulkCreateArticles(items);

    return {
      message: `Articles fetched successfully: ${articles.length}`,
    };
  }

  private async fetchExistingArticles(items: FeedItem[]) {
    const urls = items.map((item) => item.url);
    return await this.repository.fetchArticlesByUrls(urls);
  }

  private async bulkCreateArticles(items: FeedItem[]) {
    const articles = items.map((item) => ({
      media: this.media,
      title: item.title,
      author: item.author,
      description: item.description,
      url: item.url,
    }));

    return await this.repository.bulkCreateArticle(articles);
  }
}
