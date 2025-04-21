import Article from "./article";

export interface ArticleRepository {
  createArticle(
    media: string,
    title: string,
    author: string,
    description: string,
    url: string,
  ): Promise<Article>;
};
