# CLAUDE.md

- 必ず日本語で回答すること
- 敬語は使用しないこと
- TDDで進めること
- リファクタリング時は必ずlint, format, testコマンドを実行すること

このファイルはClaude Code (claude.ai/code) がこのリポジトリで作業する際のガイダンスを提供する。

## 開発コマンド

### ビルドとデプロイ

- `npm run dev` - Remixで開発サーバーを起動
- `npm run build` - 本番用ビルド

### テスト

- `npm run test:service` - ドメイン/サービス層のテストを実行
- `npm run test:api` - API層のテストを実行
- `npm run test:frontend` - フロントエンドコンポーネントのテストを実行
- `npm run e2e` - PlaywrightでE2Eテストを実行
- 個別テストファイルは 各種適切なコマンドで`-- <path/to/file>`で実行可能

### コード品質

- `npm run lint` - ESLintを実行
- `npm run lint:fix` - ESLintを自動修正付きで実行
- `npm run check-types` - TypeScript型チェックを実行
- `npm run format` - Prettierでコードフォーマットをチェック
- `npm run format:fix` - Prettierでコードフォーマットを修正
- `npm run lint:ci` - lint、format、型チェックを一括実行（基本的にこれを使用する）

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
**エラーハンドリング**: サービス層では`Result<T, E>`型を使用し、API層でHTTPExceptionに変換
**テスト**: `src/test/__mocks__/prisma.ts`でPrismaクライアントをモック
**バリデーション**: 全データ検証にドメイン層のZodスキーマを使用
**ログ**: Pinoロガーで構造化ログを使用
