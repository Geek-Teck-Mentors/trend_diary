// deno環境であることを明示するためのコメント
/// <reference lib="deno.ns" />
import { createClient } from "jsr:@supabase/supabase-js@2";
import type { Database } from "./database.types.ts";

export const rdbClient = createClient<Database>(
  // 引数はtruthyでなければならないので、仮のデフォルト値を設定
  Deno.env.get("SUPABASE_URL") ?? "https://example.com",
  Deno.env.get("SUPABASE_ANON_KEY") ?? "anon-key",
);

export type RdbClient = typeof rdbClient;
