import { InternalServerError } from "./error.ts";
import { ArticleFetcher, ArticleRepository, Executor } from "./model/interface.ts";
import { FeedItem } from "./model/types.ts";

export class ExecutorImpl implements Executor {
  constructor(
    private media: string,
    private fetcher: ArticleFetcher,
    private repository: ArticleRepository,
  ) {}

  async do(): Promise<
    {
      message: string;
      error: null;
    } | {
      message: null;
      error: InternalServerError;
    }
  > {
    console.log("Executing fetcher for media:", this.media);
    const { data: fetchedItems, error: fetchError } = await this.fetcher
      .fetch();

    if (fetchError) {
      return { message: null, error: fetchError };
    }

    if (fetchedItems.length === 0) {
      return { message: "no items", error: null };
    }

    const { data: existingArticles, error: findError } = await this
      .findExistingArticles(fetchedItems);
    if (findError) {
      return { message: null, error: findError };
    }

    const existingUrls = new Set(
      existingArticles.map((article) => article.url),
    );

    const items = fetchedItems.filter((item) => !existingUrls.has(item.url));

    console.log("Inserting items into repository:", items.length);
    const { data: articles, error: bulkCreateError } = await this
      .bulkCreateArticles(items);
    if (bulkCreateError) {
      return { message: null, error: bulkCreateError };
    }

    return {
      message: `Articles fetched successfully: ${articles.length}`,
      error: null,
    };
  }

  private async findExistingArticles(items: FeedItem[]) {
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
