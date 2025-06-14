# CLAUDE.md

- 必ず日本語で回答すること
- 敬語は使用しないこと
- TDDで進めること
- リファクタリング時は必ずlint, format, testコマンドを実行すること

このファイルはClaude Code (claude.ai/code) がこのリポジトリで作業する際のガイダンスを提供する。

## 開発コマンド

### ビルドとデプロイ

- `npm run dev` - Remixで開発サーバーを起動
- `npm run preview` - Wrangler（Cloudflare Workers）でプレビュー
- `npm run build` - 本番用ビルド
- `npm run deploy` - ビルドしてCloudflare Workersにデプロイ

### テスト

- `npm run test` - 全てのテストを実行
- `npm run test:service:coverage` - ドメイン/サービス層のテストをカバレッジ付きで実行
- `npm run test:api:coverage` - API層のテストをカバレッジ付きで実行
- `npm run test:frontend:coverage` - フロントエンドコンポーネントのテストをカバレッジ付きで実行
- `npm run e2e` - PlaywrightでE2Eテストを実行
- `npm run e2e:report` - Playwrightテストレポートを表示
- `npm run e2e:gen` - Playwrightテストコードを生成
- 個別テストファイルは `npx vitest run <path/to/test>` で実行可能

### データベース管理

- `npm run db:gen` - Prismaクライアントを生成
- `npm run db:migrate` - データベースマイグレーションを実行
- `npm run db:migrate:sql-only` - クライアント生成なしでマイグレーションを実行
- `npm run db:migrate:deploy` - 本番環境にマイグレーションをデプロイ
- `npm run db:reset` - データベースをリセットしてシードを実行
- `npm run db:studio` - Prisma Studioを開く
- `npm run supabase:db:type-gen` - Supabaseデータベース型を生成

### コード品質

- `npm run lint` - ESLintを実行
- `npm run lint:fix` - ESLintを自動修正付きで実行
- `npm run check-types` - TypeScript型チェックを実行
- `npm run format` - Prettierでコードフォーマットをチェック
- `npm run format:fix` - Prettierでコードフォーマットを修正

## アーキテクチャ概要

これは**ドメイン駆動設計（DDD）**とクリーンアーキテクチャの原則に基づく、**Cloudflare Workers + Supabase Functions**のハイブリッド構成でデプロイされるアプリケーション。

### 主要なアーキテクチャパターン

**エラーハンドリング**: 関数型エラーハンドリングに`neverthrow`ライブラリを使用

- サービス層は`Promise<Result<T, E>>`を返す
- 下位層は`ResultAsync<T, E>`を使用
- カスタムエラー型は`src/common/errors/`に定義

**ドメイン層構造**:

```
src/domain/{aggregate}/
├── model/           # ドメインエンティティ
├── service/         # ドメインビジネスロジック
├── repository/      # リポジトリインターフェース
├── schema/          # Zodバリデーションスキーマ
└── infrastructure/  # リポジトリ実装
```

**テスト戦略**（多層構造）:

- **サービス層**: `vitest/config.service.ts`でモックPrismaクライアントを使用したユニットテスト
- **API層**: `vitest/config.api.ts`で実際のデータベースを使用した統合テスト
- **フロントエンド**: `vitest/config.frontend.ts`でコンポーネントとフックのテスト
- **E2Eテスト**: エンドツーエンドシナリオのPlaywrightテスト

### 技術スタック

**ランタイム**: Cloudflare Workers（メインアプリ）+ Supabase Functions（バックグラウンドジョブ）
**バックエンド**: HonoウェブフレームワークとRemixアダプター
**フロントエンド**: Remix + React + TailwindCSS v4 + Radix UI
**データベース**: PostgreSQL + Prisma ORM
**テスト**: 各層で個別設定のVitest

### エントリーポイント

- **メインアプリケーション**: `/functions/[[path]].ts`（Cloudflare Workersエントリー）
- **開発サーバー**: `/src/application/server.ts`（Hono + Remix）
- **バックグラウンドジョブ**: `/supabase/functions/*/index.ts`

### データベーススキーマ

Prismaモデルは`prisma/models/`内のファイルに分割:

- `user.prisma` - ユーザー管理
- `account.prisma` - アカウント管理
- `session.prisma` - セッション管理
- `article.prisma` - 記事集約システム
- 全モデルは統一されたID/タイムスタンプパターンでベーススキーマを拡張

### 重要な規約

**インポート**: `src/`ルートからの絶対インポートを使用
**エラーハンドリング**: サービス層では常にResult型を使用、エラーのthrowはインフラ層のみ
**テスト**: `src/test/__mocks__/prisma.ts`でPrismaクライアントをモック
**バリデーション**: 全データ検証にドメイン層のZodスキーマを使用
**ログ**: Pinoロガーで構造化ログを使用
