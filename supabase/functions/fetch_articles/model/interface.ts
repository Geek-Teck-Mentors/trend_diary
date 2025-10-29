import {
  DatabaseError,
  InternalServerError,
  MediaFetchError,
} from "../error.ts";
import { Article, ArticleInput } from "./model.ts";
import { FeedItem } from "./types.ts";
import { Result } from "@yuukihayashi0510/core";

export interface ArticleFetcher {
  url: string;
  fetch(): Promise<Result<FeedItem[], MediaFetchError>>;
}

export interface ArticleRepository {
  bulkCreateArticle: (
    params: ArticleInput[],
  ) => Promise<Result<Article[], DatabaseError>>;
  fetchArticlesByUrls: (
    urls: string[],
  ) => Promise<Result<Article[], DatabaseError>>;
}

export interface Executor {
  do(): Promise<Result<{ message: string }, InternalServerError>>;
}
