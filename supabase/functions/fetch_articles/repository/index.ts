import supabaseClient from "../../infrastructure/supabase_client.ts";
import type { TablesInsert } from "../../infrastructure/database.types.ts";
import { Article, ArticleInput } from "../model.ts";
import type { ArticleRepository } from "./types.ts";
import { SupabaseClientError } from "./error.ts";
import { QueryError } from "jsr:@supabase/supabase-js@2";

export default class ArticleRepositoryImpl implements ArticleRepository {
  async bulkCreateArticle(params: ArticleInput[]) {
    const insertParams: TablesInsert<"articles">[] = params.map(
      this.normalizeForArticleInput,
    );

    const { data, error }: { data: Article[] | null, error: QueryError | null } = await supabaseClient
      .from("articles")
      .insert(insertParams)
      .select()
      .returns<Article[]>();

    if (error) {
      console.error("Error creating article:", error);
      throw new SupabaseClientError("Failed to create article: " + error);
    }

    if (!data) {
      console.error("No data returned from Supabase");
      throw new SupabaseClientError("No data returned from Supabase");
    }

    return data!;
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
