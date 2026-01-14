# コードベース構造

## ディレクトリ構造概要

```
trend_diary/
├── src/
│   ├── worker.ts                    # Cloudflare Workersエントリーポイント
│   ├── domain/                      # ドメイン層（ビジネスロジック）
│   │   ├── admin/                   # 管理者集約
│   │   ├── user/                    # ユーザー集約
│   │   ├── article/                 # 記事集約
│   │   ├── auth-v2/                 # 認証集約 v2
│   │   ├── permission/              # 権限集約
│   │   └── policy/                  # ポリシー集約
│   │
│   ├── application/                 # アプリケーション層
│   │   ├── server/                     # API実装
│   │   ├── client/                     # クライアントサイド実装
│   │   ├── middleware/              # ミドルウェア
│   │   ├── server.ts                # 開発サーバー（Hono + React Router）
│   │   └── env.ts                   # 環境変数定義
│   │
│   ├── infrastructure/              # インフラ層
│   │   ├── prisma-orm/              # Prismaスキーマ・マイグレーション
│   │   ├── notification/            # 通知機能
│   │   ├── rdb.ts                   # データベース接続
│   │   ├── supabase.ts              # Supabase接続
│   │   └── api.ts                   # API構成
│   │
│   ├── common/                      # 共通ユーティリティ
│   │   ├── errors/                  # カスタムエラー型
│   │   ├── types/                   # 共通型定義
│   │   ├── pagination/              # ページネーション
│   │   ├── locale/                  # ロケール設定
│   │   ├── sanitization/            # サニタイゼーション
│   │   ├── schemas.ts               # 共通スキーマ
│   │   ├── logger.ts                # ロガー設定
│   │   └── constants.ts             # 定数定義
│   │
│   ├── test/                        # テスト設定
│   │   ├── vitest/           # Vitest設定（各層）
│   │   ├── __mocks__/               # モック定義
│   │   ├── helper/                  # テストヘルパー
│   │   ├── e2e/                     # E2Eテスト
│   │   ├── setup.ts                 # テストセットアップ
│   │   └── env.ts                   # テスト環境変数
│   │
│   └── plugin/                      # Viteプラグイン等
│
├── supabase/                        # Supabase設定
│   └── functions/                   # Supabase Functions（バックグラウンドジョブ）
│
├── .storybook/                      # Storybook設定
├── public/                          # 静的ファイル
├── docs/                            # ドキュメント
│
├── package.json                     # npm設定
├── tsconfig.json                    # TypeScript設定
├── vite.config.ts                   # Vite設定
├── react-router.config.ts           # React Router設定
├── wrangler.toml                    # Cloudflare Workers設定
├── biome.json                       # Biome設定
├── playwright.config.ts             # Playwright設定
├── tailwind.config.ts               # TailwindCSS設定
└── CLAUDE.md                        # AI開発ガイドライン
```

## 各層の役割

### ドメイン層 (`src/domain/`)
- ビジネスロジックの実装
- DDDの集約ごとにディレクトリを分割
- 各集約の構造:
  - `schema/`: Zodバリデーションスキーマ
  - `infrastructure/`: リポジトリ実装
  - `repository.ts`: リポジトリインターフェース
  - `useCase.ts`: ドメインビジネスロジック
  - `index.ts`: 集約エクスポート、factory

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
- エラー型、型定義、ロガー、定数等

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
├── useCase.ts                       # ビジネスロジック
├── useCase.test.ts                  # ユニットテスト
└── index.ts                         # エクスポート
```

## エントリーポイント

1. **Cloudflare Workers**: `src/worker.ts`
2. **開発サーバー**: `src/web/server.ts`
3. **Supabase Functions**: `supabase/functions/*/index.ts`
