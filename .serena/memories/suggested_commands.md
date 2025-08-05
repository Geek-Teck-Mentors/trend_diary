# 推奨コマンド

## 開発サーバー
- `npm run dev` - 開発サーバーを起動（React Router + Hono）

## ビルド
- `npm run build` - 本番用ビルド

## テスト
- `npm run test:service` - ドメイン/サービス層のテスト
- `npm run test:api` - API層のテスト
- `npm run test:frontend` - フロントエンドテスト
- `npm run test-storybook` - Storybookテスト
- `npm run e2e` - Playwright E2Eテスト
- `npm run e2e:report` - Playwright HTMLレポート表示
- `npm run e2e:gen` - Playwrightコード生成

## コード品質（タスク完了時に実行）
- `npm run lint:ci` - Biome CI + TypeScript型チェック（推奨）
- `npm run lint` - Biomeでlint
- `npm run lint:fix` - Biomeでlint（自動修正）
- `npm run tsc` - TypeScript型チェック
- `npm run format` - Biomeでフォーマットチェック
- `npm run format:fix` - Biomeでフォーマット修正
- `npm run check` - Biome総合チェック
- `npm run check:fix` - Biome総合チェック・修正

## データベース
- `npm run db:gen` - Prisma型生成
- `npm run db:migrate` - Prismaマイグレーション（開発用）
- `npm run db:reset` - データベースリセット
- `npm run db:studio` - Prisma Studio起動

## Storybook
- `npm run storybook` - Storybook開発サーバー起動
- `npm run build-storybook` - Storybookビルド