export interface ArticleResponse {
  articleId: string;
  media: string;
  title: string;
  author: string;
  description: string;
  url: string;
  createdAt: string;
}

export interface ArticleListResponse {
  data: ArticleResponse[];
  nextCursor?: string;
  prevCursor?: string;
  hasNext: boolean;
  hasPrev: boolean;
}
