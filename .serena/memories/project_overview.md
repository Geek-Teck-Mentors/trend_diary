# Project Overview

## プロダクト名
TrendDiary

## プロダクトゴール
- **対象ユーザー**: Qiita, Zennを使っている技術者
- **目的**: 日々技術トレンドをキャッチアップしたい
- **機能**: 日常的に日記のようにトレンドを読んだか管理できるブラウザアプリ
- **差別化**: Slack RSSフィードを使ったチャンネルと違って、読んだかどうか管理しやすい機能が備わっている

## 技術スタック

### ランタイム・デプロイ
- **メインアプリ**: Cloudflare Workers
- **バックグラウンドジョブ**: Supabase Functions
- **データベース**: PostgreSQL + Prisma ORM

### フロントエンド
- React Router v7 + React
- TailwindCSS v4
- shadcn/ui
- Vite (ビルドツール)

### バックエンド
- Hono (ウェブフレームワーク)
- Hono React Router Adapter

### 開発・品質管理
- TypeScript
- Biome (Linter + Formatter)
- Vitest (テストフレームワーク、多層構成)
- Playwright (E2Eテスト)
- Storybook (UIコンポーネント開発)
- Docker (開発環境)

### エントリーポイント
- **メインアプリケーション**: `src/worker.ts` (Cloudflare Workers)
- **開発サーバー**: `src/application/server.ts` (Hono + React Router)
- **バックグラウンドジョブ**: `supabase/functions/*/index.ts`

## アーキテクチャ

### DDD + クリーンアーキテクチャ
- ドメイン駆動設計（DDD）とクリーンアーキテクチャの原則に基づく
- 関数型エラーハンドリングパターン（`Result<T, E>`型を使用）

### ディレクトリ構成
```
src/
├── application/     # アプリケーション層
│   ├── api/        # Hono API
│   ├── web/        # React Router Frontend
│   └── middleware/ # ミドルウェア
├── domain/         # ドメイン層（DDD）
│   ├── user/
│   ├── article/
│   ├── admin/
│   └── policy/
├── infrastructure/ # インフラ層
├── common/         # 共通モジュール
└── logger/         # ログ機能
```

### ドメイン層構造
各ドメインは以下の構造を持つ：
```
src/domain/{aggregate}/
├── model/           # ドメインエンティティ
├── schema/          # Zodバリデーションスキーマ
├── infrastructure/  # リポジトリ実装
├── repository.ts    # リポジトリインターフェース
├── useCase.ts       # ドメインビジネスロジック
└── index.ts         # 集約エクスポート, factory
```