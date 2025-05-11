import type { TablesInsert } from "../infrastructure/database.types.ts";
import { Article, ArticleInput } from "./model/model.ts";
import { QueryError } from "jsr:@supabase/supabase-js@2";
import { ArticleRepository } from "./model/interface.ts";
import { DatabaseError } from "./error.ts";
import { RdbClient } from "../infrastructure/supabase_client.ts";
import { logger } from "../infrastructure/logger.ts";

export default class ArticleRepositoryImpl implements ArticleRepository {
  constructor(
    private client: RdbClient,
  ) {}

  async bulkCreateArticle(params: ArticleInput[]) {
    const insertParams: TablesInsert<"articles">[] = params.map(
      this.normalizeForArticleInput,
    );

    logger.info("Start inserting articles into Supabase");

    const { data, error }: {
      data: Article[] | null;
      error: QueryError | null;
    } = await this.client
      .from("articles")
      .insert(insertParams)
      .select()
      .returns<Article[]>();

    if (error) {
      throw new DatabaseError(
        "Failed to create article: " + JSON.stringify(error),
      );
    }

    if (!data) {
      throw new DatabaseError("No data returned from Supabase");
    }

    logger.info("Inserted articles into Supabase successfully");

    return data;
  }

  private normalizeForArticleInput = (params: ArticleInput): ArticleInput => ({
    media: params.media.length > 10 ? params.media.slice(0, 10) : params.media,
    title: params.title.length > 100
      ? params.title.slice(0, 100)
      : params.title,
    author: params.author.length > 30
      ? params.author.slice(0, 30)
      : params.author,
    description: params.description.length > 255
      ? params.description.slice(0, 255)
      : params.description,
    url: params.url,
  });
}
