# Codebase Structure

## プロジェクトルート構成

```
trend_diary/
├── .serena/           # Serena MCP メモリファイル
├── .storybook/        # Storybook設定
├── .vscode/           # VS Code設定
├── docs/              # プロジェクトドキュメント
├── postgresql/        # PostgreSQL関連
├── prisma/            # Prisma設定・マイグレーション
│   ├── migrations/    # DBマイグレーションファイル
│   ├── models/        # Prismaモデル定義（分割）
│   └── seed.ts        # シードデータ
├── public/            # 静的ファイル
├── src/               # メインソースコード
├── supabase/          # Supabase Functions
│   └── functions/     # バックグラウンドジョブ
├── vitest/            # Vitest設定（多層構成）
├── CLAUDE.md          # Claude Code設定・指示
├── package.json       # npm設定・スクリプト
├── docker-compose.yml # Docker環境設定
├── biome.json         # Linter/Formatter設定
├── tsconfig.json      # TypeScript設定
├── vite.config.ts     # Vite設定
└── playwright.config.ts # E2Eテスト設定
```

## src/ ディレクトリ詳細

### メイン構成
```
src/
├── application/       # アプリケーション層
├── domain/           # ドメイン層（DDD）
├── infrastructure/   # インフラ層
├── common/           # 共通モジュール
├── test/            # テスト関連
├── logger/          # ログ機能
├── adapters/        # アダプター層
├── env.ts           # 環境変数設定
└── worker.ts        # Cloudflare Workers エントリーポイント
```

### application/ - アプリケーション層
```
application/
├── api/              # Hono API
│   ├── admin/        # 管理者API
│   ├── user/         # ユーザーAPI
│   ├── article/      # 記事API
│   ├── policy/       # ポリシーAPI
│   └── route.ts      # APIルーティング
├── web/              # React Router Frontend
│   ├── components/   # UIコンポーネント
│   ├── features/     # 機能別コンポーネント
│   ├── hooks/        # カスタムフック
│   ├── routes/       # ページコンポーネント・ルーティング
│   ├── types/        # フロントエンド型定義
│   └── infrastructure/ # フロントエンド用インフラ
├── middleware/       # ミドルウェア
│   ├── authenticator.ts    # 認証
│   ├── zodValidator.ts     # バリデーション
│   ├── errorHandler.ts     # エラーハンドリング
│   └── requestLogger.ts    # リクエストログ
└── server.ts         # 開発サーバー
```

### domain/ - ドメイン層（DDD）
各集約は同じ構造を持つ：

```
domain/{aggregate}/   # user, article, admin, policy
├── model/           # ドメインエンティティ・値オブジェクト
├── schema/          # Zodバリデーションスキーマ
├── infrastructure/  # リポジトリ実装
│   ├── mapper.ts    # DTO ↔ Entity変換
│   ├── queryImpl.ts # クエリ実装
│   └── commandImpl.ts # コマンド実装
├── repository.ts    # リポジトリインターフェース
├── useCase.ts       # ユースケース（アプリケーションサービス）
├── dto.ts          # データ転送オブジェクト（一部集約）
└── index.ts        # ファクトリー・エクスポート
```

#### 集約一覧
- **user/**: ユーザー管理（認証、プロフィール）
- **article/**: 記事管理（読書履歴、トレンド）
- **admin/**: 管理機能（ユーザー管理、権限）
- **policy/**: ポリシー管理（プライバシーポリシー等）

### common/ - 共通モジュール
```
common/
├── types/           # 共通型定義
│   └── utility.ts   # Result型、ユーティリティ型
├── errors/          # エラー型定義
│   ├── clientError.ts      # 400系エラー
│   ├── serverError.ts      # 500系エラー
│   ├── notFoundError.ts    # 404エラー
│   ├── alreadyExistsError.ts # 409エラー
│   ├── handle.ts           # エラー変換
│   └── index.ts
├── pagination/      # ページネーション機能
├── sanitization/    # データサニタイゼーション
├── schemas.ts       # 共通スキーマ
└── constants.ts     # 定数定義
```

### test/ - テスト関連
```
test/
├── __mocks__/       # モック定義
│   └── prisma.ts    # Prismaモック（ドメインテスト用）
├── helper/          # テストヘルパー
│   ├── articleTestHelper.ts
│   ├── adminUserTestHelper.ts
│   ├── activeUserTestHelper.ts
│   └── policyTestHelper.ts
├── e2e/            # E2Eテスト
│   ├── page/       # ページオブジェクト
│   └── scenario/   # シナリオテスト
├── setup.ts        # テスト環境セットアップ
└── env.ts          # テスト環境変数
```

### React Router Web構造詳細

#### components/ - UIコンポーネント
```
components/
├── ui/              # shadcn/ui基底コンポーネント
│   ├── hooks/       # UIフック
│   ├── lib/         # UIユーティリティ
│   └── *.tsx        # Button, Card, Table等
├── customized/      # カスタマイズコンポーネント
├── Header/          # ヘッダーコンポーネント
├── Footer/          # フッターコンポーネント
├── Sidebar/         # サイドバーコンポーネント
├── ClipText/        # テキスト省略コンポーネント
└── PageError/       # エラーページコンポーネント
```

#### routes/ - ルーティング・ページ
```
routes/
├── _index.tsx           # トップページ
├── trends.tsx           # トレンド一覧レイアウト
├── trends._index/       # トレンド一覧ページ
│   ├── components/      # ページ専用コンポーネント
│   ├── page.tsx         # ページコンポーネント
│   ├── route.tsx        # ルート設定
│   └── *.ts            # フック・ロジック
├── login/              # ログインページ
├── signup/             # サインアップページ
├── admin._layout.tsx   # 管理画面レイアウト
├── admin._index.tsx    # 管理画面トップ
└── admin.users/        # ユーザー管理ページ
```

## 設定ファイル詳細

### Vitest設定（多層テスト）
```
vitest/
├── config.domain.ts     # ドメインテスト（モック使用）
├── config.api.ts        # APIテスト（実DB使用）
├── config.frontend.ts   # フロントエンドテスト
└── config.storybook.ts  # Storybookテスト
```

### Prismaモデル分割
```
prisma/models/
├── main.prisma          # メインスキーマ
├── user.prisma          # ユーザー
├── active_user.prisma   # アクティブユーザー
├── ban_user.prisma      # BANユーザー
├── leaved_user.prisma   # 退会ユーザー
├── session.prisma       # セッション
├── article.prisma       # 記事
├── read_history.prisma  # 読書履歴
└── privacy_policy.prisma # プライバシーポリシー
```

## 重要な命名規則

### ファイル命名
- **コンポーネント**: PascalCase (Button.tsx, UserCard.tsx)
- **フック**: camelCase (useUser.ts, useArticle.ts)
- **ユーティリティ**: camelCase (validation.ts, api.ts)
- **テストファイル**: 実装ファイル名 + .test.ts

### ディレクトリ命名
- **ドメイン集約**: snake_case (user, article, admin, policy)
- **React routes**: React Router規約 (trends._index, admin.users)
- **コンポーネント**: PascalCase (Header, Sidebar)

### インポート規則
- 絶対パス: `@/*` でsrcルートから
- 相対パス: 同一ディレクトリ内のみ使用