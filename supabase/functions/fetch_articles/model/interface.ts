import { Article, ArticleInput } from "./model.ts";
import { FeedItem } from "./types.ts";

export interface ArticleFetcher {
  url: string;
  fetch(): Promise<FeedItem[]>;
}

export interface ArticleRepository {
  bulkCreateArticle: (params: ArticleInput[]) => Promise<Article[]>;
  fetchArticlesByUrls: (urls: string[]) => Promise<Article[]>;
}
