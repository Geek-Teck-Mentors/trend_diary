export default class Article {
  constructor(
    public articleId: bigint,
    public title: string,
    public content: string,
    public authorId: bigint,
    public readonly createdAt: Date = new Date(),
  ) {}
}
