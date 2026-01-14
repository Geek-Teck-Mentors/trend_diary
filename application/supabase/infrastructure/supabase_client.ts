// deno環境であることを明示するためのコメント
/// <reference lib="deno.ns" />
import { createClient } from "jsr:@supabase/supabase-js@2";
import type { Database } from "./database.types.ts";

export const rdbClient = createClient<Database>(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_ANON_KEY") ?? "",
);

export type RdbClient = typeof rdbClient;
