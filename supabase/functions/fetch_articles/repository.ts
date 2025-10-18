import type { TablesInsert } from "../../infrastructure/database.types.ts";
import { Article, ArticleInput } from "./model/model.ts";
import { QueryError } from "jsr:@supabase/supabase-js@2";
import { ArticleRepository } from "./model/interface.ts";
import { DatabaseError } from "./error.ts";
import { RdbClient } from "../../infrastructure/supabase_client.ts";
import { logger } from "../../logger/logger.ts";

export default class ArticleRepositoryImpl implements ArticleRepository {
  constructor(
    private client: RdbClient,
  ) {}

  async bulkCreateArticle(params: ArticleInput[]) {
    const insertParams: TablesInsert<"articles">[] = params.map(
      this.normalizeForArticleInput,
    );

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
    media: this.sliceString(params.media, 10),
    title: this.sliceString(params.title, 100),
    author: this.sliceString(params.author, 30),
    description: this.sliceString(params.description, 1024),
    url: params.url,
  });

  private sliceString = (str: string, maxLength: number) => {
    // INFO: サロゲートペアを考慮して文字列を分割
    return [...str].slice(0, maxLength).join("");
  };
}
