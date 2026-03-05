# データベース接続とマイグレーション

## データベース接続時の型取得

- アプリケーション側（バックエンド/API）
  - `@prisma/client` + `@prisma/adapter-d1` を使用
- Supabase Edge Functions側
  - `supabase-js` を使用

## マイグレーションファイルの生成

Prisma schemaを編集後、ローカル開発DB(SQLite: `dev.db`)に反映する場合:

1. Prisma schemaを編集
2. `npm run db:migrate:dev`

`DATABASE_URL`で接続先を指定した環境（例: CIの`test.db`）に反映する場合:

1. Prisma schemaを編集
2. `npm run db:migrate`

D1向けSQLを作成・適用する場合:

1. `npm run d1:diff:init` （初期作成時）
2. `npm run d1:apply:local`
3. 本番は `npm run d1:apply:remote`

(参考: https://www.prisma.io/docs/orm/prisma-migrate/getting-started)

## マイグレーション後の作業

1. `npm run db:gen` で `@prisma/client` の更新
2. supabase-js 向け型定義の更新(supabaseのfunctionsで参照するデータベースを変更した場合)
   1. Supabaseをローカルで起動(ローカルの場合)
   2. supabase のデータベースにマイグレーションを適用
   3. `npm run supabase:db:type-gen` を実行
