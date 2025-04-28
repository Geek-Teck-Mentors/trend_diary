// eslint-disable-next-line import/prefer-default-export
export class Article {
  constructor(
    public articleId: bigint,
    public media: string,
    public title: string,
    public author: string,
    public description: string,
    public url: string,
    public readonly createdAt: Date = new Date(),
  ) {}
}

export type ArticleInput = Omit<Article, 'articleId' | 'createdAt'>;
