import { Article, ArticleInput } from "../model.ts";

export interface ArticleRepository {
  bulkCreateArticle: (params: ArticleInput[]) => Promise<Article[]>;
}
