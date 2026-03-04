# データベース接続とマイグレーション

## データベース接続時の型取得

- アプリケーション側（バックエンド/API）
  - `@prisma/client` + `@prisma/adapter-d1` を使用
- Supabase Edge Functions側
  - `supabase-js` を使用

## マイグレーションファイルの生成

Prisma schemaを編集後、ローカル(SQLite)に反映する場合:

1. Prisma schemaを編集
2. `npm run db:migrate`

D1向けSQLを作成・適用する場合:

1. `npm run db:d1:diff:init` （初期作成時）
2. `npm run db:d1:migrations:apply:local`
3. 本番は `npm run db:d1:migrations:apply:remote`

(参考: https://www.prisma.io/docs/orm/prisma-migrate/getting-started)

## マイグレーション後の作業

1. `npm run db:gen` で `@prisma/client` の更新
2. supabase-js 向け型定義の更新(supabaseのfunctionsで参照するデータベースを変更した場合)
   1. Supabaseをローカルで起動(ローカルの場合)
   2. supabase のデータベースにマイグレーションを適用
   3. `npm run supabase:db:type-gen` を実行
