import {
  ArticleFetcher,
  ArticleRepository,
  Executor,
} from "./model/interface.ts";
import { isError, resultError, resultSuccess } from "./model/result.ts";
import { FeedItem } from "./model/types.ts";
import { DatabaseError, MediaFetchError } from "./error.ts";

type ExecutorData = { message: string };

export class ExecutorImpl implements Executor {
  constructor(
    private media: string,
    private fetcher: ArticleFetcher,
    private repository: ArticleRepository,
  ) {}

  async do() {
    console.log("Executing fetcher for media:", this.media);
    const fetchResult = await this.fetcher.fetch();

    if (isError(fetchResult)) {
      return resultError<ExecutorData, MediaFetchError>(fetchResult.error);
    }

    const fetchedItems = fetchResult.data;

    if (fetchedItems.length === 0) {
      return resultSuccess<ExecutorData>({ message: "no items" });
    }

    const findResult = await this.findExistingArticles(fetchedItems);
    if (isError(findResult)) {
      return resultError<ExecutorData, DatabaseError>(findResult.error);
    }

    const existingArticles = findResult.data;
    const existingUrls = new Set(
      existingArticles.map((article) => article.url),
    );

    const items = fetchedItems.filter((item) => !existingUrls.has(item.url));

    console.log("Inserting items into repository:", items.length);
    const bulkCreateResult = await this.bulkCreateArticles(items);
    if (isError(bulkCreateResult)) {
      return resultError<ExecutorData, DatabaseError>(bulkCreateResult.error);
    }

    const articles = bulkCreateResult.data;

    return resultSuccess<ExecutorData>({
      message: `Articles fetched successfully: ${articles.length}`,
    });
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
