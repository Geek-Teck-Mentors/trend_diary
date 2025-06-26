export type Article = {
  articleId: number;
  media: string;
  title: string;
  author: string;
  description: string;
  url: string;
  createdAt: Date;
};

export type Direction = 'next' | 'prev';

export type Cursor = {
  [key in Direction]?: string;
};
