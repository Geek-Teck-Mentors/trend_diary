# コードベース構造

## トップレベルディレクトリ
```
project_root/
├── src/                    # メインソースコード
├── prisma/                 # Prismaスキーマ・マイグレーション
├── vitest/                 # テスト設定（5つの設定ファイル）
├── docs/                   # ドキュメント
├── .storybook/             # Storybook設定
├── public/                 # 静的ファイル
├── supabase/               # Supabaseファンクション
├── .github/                # GitHub Actions
└── functions/              # Cloudflare Workers エントリーポイント
```

## src/ ディレクトリ構造
```
src/
├── application/            # アプリケーション層
│   ├── api/               # Hono API (user, article, policy)
│   ├── web/               # React Router Frontend
│   ├── middleware/        # 共通ミドルウェア
│   ├── server.ts          # アプリケーションサーバー
│   └── env.ts             # 環境変数
├── domain/                # ドメイン層（DDD）
│   ├── user/              # ユーザー集約
│   ├── article/           # 記事集約
│   └── policy/            # ポリシー集約
├── common/                # 共通ユーティリティ
│   ├── types/             # 型定義（Result<T,E>等）
│   ├── errors/            # エラークラス
│   ├── schema/            # 共通スキーマ
│   └── pagination/        # ページネーション
├── infrastructure/        # インフラ層
├── test/                  # テストヘルパー・モック
└── logger/                # Pinoロガー設定
```

## 重要ファイル
- `package.json` - 依存関係・スクリプト定義
- `biome.json` - Linter・Formatter設定
- `tsconfig.json` - TypeScript設定（@/*パスマッピング）
- `vite.config.ts` - Viteビルド設定
- `wrangler.toml` - Cloudflare Workers設定
- `docker-compose.yml` - PostgreSQL開発環境