import { ArticleFetcher, ArticleRepository } from "./model/interface.ts";
import { ArticleInput } from "./model/model.ts";

export class Executor {
  constructor(
    private media: string,
    private fetcher: ArticleFetcher,
    private repository: ArticleRepository,
  ) {}

  async do() {
    console.log("Executing fetcher for media:", this.media);
    const items = await this.fetcher.fetch();
    if (items.length === 0) {
      return { message: "no items" };
    }

    console.log("Inserting items into repository:", items.length);
    const articles = await this.repository.bulkCreateArticle(
      items.map((item) => ({
        media: this.media,
        title: item.title,
        author: item.author,
        description: item.description,
        url: item.url,
      } satisfies ArticleInput)),
    );

    return {
      message: `Articles fetched successfully: ${articles.length}`,
    };
  }
}
