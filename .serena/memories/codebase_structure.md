# コードベース構造

## ディレクトリ構造概要

```
trend_diary/
├── application/                     # メインアプリケーション
│   ├── src/
│   │   ├── web/                     # アプリケーション層
│   │   │   ├── server/              # Hono API
│   │   │   │   ├── article/         # 記事API
│   │   │   │   ├── handler/         # ハンドラーファクトリー
│   │   │   │   ├── v2/              # API v2
│   │   │   │   └── route.ts
│   │   │   ├── middleware/          # ミドルウェア
│   │   │   │   ├── authenticator/   # 認証ミドルウェア
│   │   │   │   ├── context.ts
│   │   │   │   ├── error-handler.ts
│   │   │   │   ├── request-logger.ts
│   │   │   │   └── zod-validator.ts
│   │   │   ├── client/              # React Router v7 フロントエンド
│   │   │   │   ├── components/      # 共通コンポーネント
│   │   │   │   │   ├── customized/  # カスタムコンポーネント
│   │   │   │   │   ├── shadcn/      # shadcn/ui統合
│   │   │   │   │   └── ui/          # UIコンポーネント
│   │   │   │   ├── features/        # 機能別コンポーネント
│   │   │   │   ├── hooks/           # カスタムフック
│   │   │   │   ├── lib/             # ユーティリティ
│   │   │   │   ├── routes/          # ページルート
│   │   │   │   └── infrastructure/  # フロントエンド用インフラ
│   │   │   ├── worker.ts            # Cloudflare Workersエントリーポイント
│   │   │   ├── server.ts            # 開発サーバー（Hono + React Router）
│   │   │   └── env.ts               # 環境変数定義
│   │   │
│   │   ├── domain/                  # ドメイン層（ビジネスロジック）
│   │   │   ├── article/             # 記事集約
│   │   │   └── user/                # ユーザー集約
│   │   │
│   │   ├── infrastructure/          # インフラ層
│   │   │   ├── prisma-orm/          # Prismaスキーマ・マイグレーション
│   │   │   │   ├── models/          # Prismaモデル
│   │   │   │   ├── migrations/      # マイグレーション
│   │   │   │   └── main.prisma
│   │   │   ├── notification/        # 通知機能
│   │   │   ├── api.ts               # API構成
│   │   │   ├── rdb.ts               # データベース接続
│   │   │   └── supabase.ts          # Supabase接続
│   │   │
│   │   ├── common/                  # 共通ユーティリティ
│   │   │   ├── errors/              # カスタムエラー型
│   │   │   ├── types/               # 共通型定義
│   │   │   ├── pagination/          # ページネーション
│   │   │   ├── locale/              # ロケール設定
│   │   │   ├── sanitization/        # サニタイゼーション
│   │   │   ├── schemas.ts           # 共通スキーマ
│   │   │   └── logger.ts            # ロガー設定
│   │   │
│   │   ├── test/                    # テスト設定
│   │   │   ├── vitest/              # Vitest設定（各層）
│   │   │   │   ├── client/          # クライアント側テスト設定
│   │   │   │   ├── common/          # 共通テスト設定
│   │   │   │   ├── domain/          # ドメイン層テスト設定
│   │   │   │   ├── server/          # サーバー側テスト設定
│   │   │   │   └── storybook/       # Storybook用テスト設定
│   │   │   ├── __mocks__/           # モック定義
│   │   │   ├── helper/              # テストヘルパー
│   │   │   ├── e2e/                 # E2Eテスト
│   │   │   └── env.ts               # テスト環境変数
│   │   │
│   │   └── plugin/                  # プラグイン
│   │       └── biome/               # Biomeプラグイン
│   │
│   ├── supabase/                    # Supabase設定
│   │   └── functions/               # Supabase Functions（バックグラウンドジョブ）
│   │
│   ├── .storybook/                  # Storybook設定
│   ├── public/                      # 静的ファイル
│   │
│   ├── package.json                 # npm設定
│   ├── tsconfig.json                # TypeScript設定
│   ├── vite.config.ts               # Vite設定
│   ├── react-router.config.ts       # React Router設定
│   ├── wrangler.toml                # Cloudflare Workers設定
│   ├── biome.json                   # Biome設定
│   ├── tailwind.config.ts           # TailwindCSS設定
│   └── components.json              # shadcn/ui設定
│
├── docs/                            # ドキュメント
├── .github/                         # GitHub Actions
└── CLAUDE.md                        # AI開発ガイドライン
```

## 各層の役割

### ドメイン層 (`src/domain/`)
- ビジネスロジックの実装
- DDDの集約ごとにディレクトリを分割
- 現在の集約: article, user
- 各集約の構造:
  - `schema/`: Zodバリデーションスキーマ
  - `infrastructure/`: リポジトリ実装
  - `repository.ts`: リポジトリインターフェース
  - `use-case.ts`: ドメインビジネスロジック
  - `factory.ts`: ファクトリー関数
  - `index.ts`: 集約エクスポート

### アプリケーション層 (`src/web/`)
- API/Webページのエンドポイント実装
- ミドルウェアの実装
- ドメイン層とインフラ層の橋渡し

### インフラ層 (`src/infrastructure/`)
- データベースアクセス（Prisma ORM）
- 外部サービス連携（Supabase等）
- 技術的な実装詳細

### 共通層 (`src/common/`)
- 全層で使用する共通ユーティリティ
- エラー型、型定義、ロガー等

### テスト (`src/test/`)
- 各層ごとのVitest設定
- モック定義
- E2Eテスト
- テストヘルパー

## ドメイン集約の例（article）

```
src/domain/article/
├── schema/                          # Zodスキーマ
├── infrastructure/                  # リポジトリ実装
├── repository.ts                    # リポジトリIF
├── use-case.ts                      # ビジネスロジック
├── use-case.test.ts                 # ユニットテスト
└── index.ts                         # エクスポート
```

## エントリーポイント

1. **Cloudflare Workers**: `src/web/worker.ts`
2. **開発サーバー**: `src/web/server.ts`
3. **Supabase Functions**: `supabase/functions/*/index.ts`

## 重要なパスの変更（旧→新）

- ファイル名: キャメルケース → ケバブケース
  - `useCase.ts` → `use-case.ts`
  - `errorHandler.ts` → `error-handler.ts`
  - `requestLogger.ts` → `request-logger.ts`
  - `zodValidator.ts` → `zod-validator.ts`
