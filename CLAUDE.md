# CLAUDE.md

- 必ず日本語で回答すること
- 敬語は使用しないこと
- リファクタリング時は必ずlint, format, testコマンドを実行すること

## 開発フロー

**コミットタイプ（Conventional Commits）:**

- `feat:` - 新機能追加
- `fix:` - バグ修正
- `refactor:` - リファクタリング（機能変更なし）
- `test:` - テスト追加・修正
- `docs:` - ドキュメント更新
- `style:` - コードスタイル修正（フォーマット等）
- `perf:` - パフォーマンス改善
- `chore:` - ビルドプロセス・補助ツール等の変更

**使用例:**

```bash
# 新機能の場合
git commit -m "feat: add user authentication TDD cycle complete"

# バグ修正の場合
git commit -m "fix: resolve login validation issue TDD cycle complete"

# リファクタリングの場合
git commit -m "refactor: improve article service structure TDD cycle complete"
```

## 開発コマンド

### ビルドとデプロイ

- `npm run dev` - Remixで開発サーバーを起動
- `npm run build` - 本番用ビルド

### テスト

- `npm run test:service` - ドメイン/サービス層のテストを実行
- `npm run test:api` - API層のテストを実行
- `npm run test:frontend` - フロントエンドコンポーネントのテストを実行
- `npm run test-storybook` - Storybookのテストを実行
- `npm run e2e` - PlaywrightでE2Eテストを実行
- `npm run e2e:report` - PlaywrightのHTMLレポートを表示
- `npm run e2e:gen` - Playwrightのコード生成ツールを起動
- 個別テストファイルは 各種適切なコマンドで`-- <path/to/file>`で実行可能

### Storybook

- `npm run storybook` - Storybookを開発モードで起動
- `npm run build-storybook` - Storybookをビルド

### データベース

- `npm run db:gen` - Prisma型生成
- `npm run db:migrate` - Prismaマイグレーション実行（開発用）
- `npm run db:migrate:sql-only` - SQLのみのマイグレーション実行
- `npm run db:migrate:deploy` - 本番用マイグレーション実行
- `npm run db:reset` - データベースリセット
- `npm run db:studio` - Prisma Studio起動
- `npm run supabase:db:type-gen` - Supabase型生成

### コード品質

- `npm run lint` - Biomeでlintを実行
- `npm run lint:fix` - Biomeでlintを自動修正付きで実行
- `npm run check-types` - TypeScript型チェックを実行
- `npm run format` - Biomeでコードフォーマットをチェック
- `npm run format:fix` - Biomeでコードフォーマットを修正
- `npm run check` - Biomeで総合チェック
- `npm run check:fix` - Biomeで総合チェック・修正
- `npm run lint:ci` - biome ci実行 + 型チェック（基本的にこれを使用する）

## 開発環境設定

### ローカル開発サーバー

- **開発サーバー**: `http://localhost:5173` (Vite + Remix)
- **Storybook**: `http://localhost:6006` (UIコンポーネント開発)
- **E2Eテスト**: `http://localhost:5173` (Playwright baseURL)

### 環境変数

必要な環境変数については`.dev.vars.example`を参照すること

## アーキテクチャ概要

これは**ドメイン駆動設計（DDD）**とクリーンアーキテクチャの原則に基づく、**Cloudflare Workers + Supabase Functions**のハイブリッド構成でデプロイされるアプリケーション。

### 主要なアーキテクチャパターン

**エラーハンドリング**: 関数型エラーハンドリングパターンを使用

- サービス層は`Result<T, E>`型を返す（`src/common/types/utility.ts`で定義）
- 非同期処理では`AsyncResult<T, E>`型を使用
- エラーハンドリングヘルパー関数を活用:
  - `resultSuccess<T>(value: T)`: 成功結果を作成
  - `resultError<T, E>(error: E)`: エラー結果を作成
  - `isSuccess<T, E>(result)`: 成功かどうかを判定
  - `isError<T, E>(result)`: エラーかどうかを判定
- カスタムエラー型は`src/common/errors/`に定義:
  - `ClientError`: クライアントエラー（400系）
  - `ServerError`: サーバーエラー（500系）
  - `NotFoundError`: リソースが見つからない
  - `AlreadyExistsError`: リソースが既に存在
- API層では`handleError`関数でHTTPExceptionに変換
- utilsの作成は禁止

**ドメイン層構造**:

```
src/domain/{aggregate}/
├── factory/         # ドメインサービスファクトリ
├── model/           # ドメインエンティティ
├── service/         # ドメインビジネスロジック
├── repository/      # リポジトリインターフェース
├── schema/          # Zodバリデーションスキーマ
├── infrastructure/  # リポジトリ実装
└── index.ts         # 集約エクスポート
```

**テスト戦略**（多層構造）:

- **サービス層**: `vitest/config.service.ts`でモックPrismaクライアントを使用したユニットテスト
- **API層**: `vitest/config.api.ts`で実際のデータベースを使用した統合テスト
- **フロントエンド**: `vitest/config.frontend.ts`でコンポーネントとフックのテスト
- **Storybook**: `vitest/config.storybook.ts`でUIコンポーネントのビジュアルテスト
- **E2Eテスト**: エンドツーエンドシナリオのPlaywrightテスト

### 技術スタック

**ランタイム**: Cloudflare Workers（メインアプリ）+ Supabase Functions（バックグラウンドジョブ）
**バックエンド**: HonoウェブフレームワークとRemixアダプター
**フロントエンド**: Remix + React + TailwindCSS v4 + shadcn/ui
**データベース**: PostgreSQL + Prisma ORM
**テスト**: 各層で個別設定のVitest + Playwright E2E
**ビルドツール**: Vite
**コード品質**: Biome + TypeScript

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

**インポート**: `src/`ルートからの絶対インポートを使用（TypeScript path mapping: `@/*`）
**エラーハンドリング**: サービス層では`Result<T, E>`型を使用し、API層でHTTPExceptionに変換
**テスト**: `src/test/__mocks__/prisma.ts`でPrismaクライアントをモック, serviceテストのみで利用
**バリデーション**: データ検証にドメイン層のZodスキーマを使用
**ログ**: Pinoロガーで構造化ログを使用

**API層バリデーション**: 全てのAPI層エンドポイントで`zodValidator`の使用が必須

- **必須ルール**: 全APIエンドポイントでリクエストデータのバリデーションにzodValidatorを使用する
- **バリデーション対象**: 
  - `query`: クエリパラメータのバリデーション
  - `param`: パスパラメータのバリデーション  
  - `json`: リクエストボディのバリデーション
- **エラーハンドリング**: バリデーション失敗時は自動的に422ステータスで返却
- **型安全性**: `ZodValidatedContext`系の型を使用してハンドラー関数で型安全にデータアクセス

**バリデーション順序**: authenticator → zodValidator(param) → zodValidator(json) → handler
