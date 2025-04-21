import { RdbClient } from "@/infrastructure/rdb";
import { ArticleRepository } from "../article/repository";
import Article from "../article/article";

export default class ArticleRepositoryImpl implements ArticleRepository {
  constructor(private db: RdbClient) {}

  async createArticle(
    media: string,
    title: string,
    author: string,
    description: string,
    url: string,
  ): Promise<Article> {
    const newArticle = await this.db.article.create({
      data: {
        media,
        title,
        author,
        description,
        url,
      },
    });

    return new Article(
      newArticle.articleId,
      newArticle.media,
      newArticle.title,
      newArticle.author,
      newArticle.description,
      newArticle.url,
      newArticle.createdAt,
    );
  }
}
