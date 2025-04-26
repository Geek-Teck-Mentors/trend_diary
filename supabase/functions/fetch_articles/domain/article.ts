// eslint-disable-next-line import/prefer-default-export
export class Article {
  constructor(
    public articleId: bigint,
    public media: 'qiita' | 'zenn',
    public title: string,
    public author: string,
    public description: string,
    public url: string,
    public readonly createdAt: Date = new Date(),
  ) {}
}
