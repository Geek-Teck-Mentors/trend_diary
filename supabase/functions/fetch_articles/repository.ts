import supabaseClient from "../infrastructure/supabase_client.ts";
import type { TablesInsert } from "../infrastructure/database.types.ts";
import { Article, ArticleInput } from "./model.ts";

export type BulkCreateArticlesParams = ArticleInput[];

const normalizeForArticleInput = (params: ArticleInput): ArticleInput => ({
  media: params.media.length > 10 ? params.media.slice(0, 10) : params.media,
  title: params.title.length > 100 ? params.title.slice(0, 100) : params.title,
  author: params.author.length > 30
    ? params.author.slice(0, 30)
    : params.author,
  description: params.description.length > 255
    ? params.description.slice(0, 255)
    : params.description,
  url: params.url,
});

export const bulkCreateArticle = async (
  params: BulkCreateArticlesParams,
): Promise<void> => {
  const insertParams: TablesInsert<"articles">[] = params.map(
    normalizeForArticleInput,
  );

  const { error } = await supabaseClient
    .from("articles")
    .insert(insertParams)
    .select()
    .returns<Array<Article>>();

  if (error) {
    console.error("Error creating article:", error);
    throw new Error("Failed to create article: " + error);
  }
};
