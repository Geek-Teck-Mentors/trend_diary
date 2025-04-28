import { QueryError } from 'jsr:@supabase/supabase-js@2';
import supabaseClient from '../infrastructure/supabase_client.ts';
import type { TablesInsert } from '../infrastructure/database.types.ts';
import { Article } from './model.ts';
import { normalizeForArticleInput } from './domain/schema.ts';

export type BulkCreateArticlesParams = TablesInsert<'articles'>[];

export const bulkCreateArticle = async (
  params: BulkCreateArticlesParams,
): Promise<{ data: Article[] | null; error: QueryError | null }> => {
  const insertParams = params.map((param) => ({
    ...normalizeForArticleInput(param),
  }));

  const { data, error } = await supabaseClient
    .from('articles')
    .insert(insertParams)
    .select()
    .returns<Array<Article>>();

  if (error) {
    console.error('Error creating article:', error);
    return { data: null, error };
  }

  return { data, error: null };
};
