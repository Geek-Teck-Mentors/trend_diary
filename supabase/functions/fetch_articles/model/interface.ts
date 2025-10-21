import { DatabaseError, InternalServerError, MediaFetchError } from "../error.ts";
import { Article, ArticleInput } from "./model.ts";
import { FeedItem, Result } from "./types.ts";

export interface ArticleFetcher {
  url: string;
  fetch(): Promise<Result<FeedItem[], MediaFetchError>>;
}

export interface ArticleRepository {
  bulkCreateArticle: (params: ArticleInput[]) => Promise<Result<Article[], DatabaseError>>;
  fetchArticlesByUrls: (urls: string[]) => Promise<Result<Article[], DatabaseError>>;
}

export interface Executor {
  do(): Promise<Result<{ message: string }, InternalServerError>>;
}
