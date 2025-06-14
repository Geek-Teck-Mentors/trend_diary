export interface ArticleResponse {
  articleId: string;
  media: string;
  title: string;
  author: string;
  description: string;
  url: string;
  createdAt: string;
}

export type ArticleListResponse = ArticleResponse[];
