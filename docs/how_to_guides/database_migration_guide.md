# データベース接続とマイグレーション

## データベース接続時の型取得

- アプリケーション側（バックエンド/API）
  - `@prisma/client` を使用
- Supabase Edge Functions側
  - `supabase-js` を使用

## マイグレーションファイルの生成

Prisma公式ドキュメントに従い以下を実行

1. Prisma schemaを編集
2. `npm run db:migrate`

(参考: https://www.prisma.io/docs/orm/prisma-migrate/getting-started)

## マイグレーション後の作業

1. `npm run db:gen` で `@prisma/client` の更新
2. supabase-js 向け型定義の更新
   1. Supabaseをローカルで起動(ローカルの場合)
   2. supabase のデータベースにマイグレーションを適用
   3. `npx supabase gen types typescript --local` を実行
   4. 生成された型定義を `database.types.ts` にコピー
