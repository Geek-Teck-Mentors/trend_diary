import { Article, ArticleInput } from "./model.ts";
import { FeedItem, Result } from "./types.ts";

export interface ArticleFetcher {
  url: string;
  fetch(): Promise<Result<FeedItem[]>>;
}

export interface ArticleRepository {
  bulkCreateArticle: (params: ArticleInput[]) => Promise<Result<Article[]>>;
  fetchArticlesByUrls: (urls: string[]) => Promise<Result<Article[]>>;
}

export interface Executor {
  do(): Promise<
    { message: string; error: null } | { message: null; error: Error }
  >;
}
