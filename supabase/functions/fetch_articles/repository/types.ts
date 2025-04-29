import { ArticleInput } from "../model.ts";

export interface ArticlesRepository {
  bulkCreateArticle: (params: ArticleInput[]) => Promise<void>;
}
