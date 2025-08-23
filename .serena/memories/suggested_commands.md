# 推奨開発コマンド

## 基本開発フロー
```bash
# 開発サーバー起動
npm start

# ビルド
npm run build
```

## テストコマンド
```bash
# 各層のテスト
npm run test:domain       # ドメイン層テスト
npm run test:api          # API層テスト  
npm run test:frontend     # フロントエンドテスト
npm run test-storybook    # Storybookテスト

# E2Eテスト
npm run e2e               # Playwrightテスト実行
npm run e2e:report        # レポート表示
npm run e2e:gen           # コード生成

# 個別ファイルテスト
npm run test:domain -- <path/to/file>
```

## コード品質
```bash
# 基本チェック（推奨）
npm run lint           # Biome CI + 型チェック

# 個別実行
npm run lint              # Lintチェック
npm run lint:fix          # Lint自動修正
npm run format            # フォーマットチェック
npm run format:fix        # フォーマット修正
npm run check             # 総合チェック
npm run check:fix         # 総合チェック・修正
npm run tsc               # TypeScript型チェック
```

## データベース
```bash
npm run db:gen            # Prisma型生成
npm run db:migrate        # マイグレーション実行
npm run db:migrate:sql-only # SQLのみマイグレーション
npm run db:migrate:deploy # 本番マイグレーション
npm run db:reset          # DB リセット
npm run db:studio         # Prisma Studio
npm run supabase:db:type-gen # Supabase型生成
```

## Storybook
```bash
npm run storybook         # 開発モード起動
npm run build-storybook   # ビルド
```

## 環境設定
```bash
# 初期セットアップ
npm ci
cp .dev.vars.example .dev.vars
cp .dev.vars.example .env
docker compose up -d
npm run db:migrate
```