# Suggested Commands

## セットアップ・環境構築

### 初回セットアップ
```bash
# 依存関係のインストール
npm i

# 環境変数のコピー
cp .dev.vars.example .dev.vars

# Docker環境でDBを起動
docker compose up -d

# DBマイグレーション実行
npm run db:migrate
```

### 開発サーバー起動
```bash
# メイン開発サーバー（Docker DB自動起動・停止付き）
npm start

# Storybook起動
npm run storybook
```

## テスト実行

### 各層のテスト実行
```bash
# ドメイン層テスト（モックPrisma使用）
npm run test:domain

# API層テスト（実DB使用）
npm run test:api

# フロントエンドテスト
npm run test:frontend

# Storybookテスト
npm run test-storybook

# E2Eテスト
npm run e2e
npm run e2e:report  # HTMLレポート表示
npm run e2e:gen     # コード生成ツール
```

### 個別テスト実行
```bash
# 特定のテストファイルを実行
npm run test:domain -- path/to/test.ts
npm run test:api -- path/to/test.ts
npm run test:frontend -- path/to/test.ts
```

## コード品質・ビルド

### Lint & Format
```bash
# 基本チェック（推奨）
npm run lint  # Biome CI + TypeScript型チェック

# 個別実行
npm run tsc            # TypeScript型チェックのみ
npm run check          # Biome総合チェック
npm run check:fix      # Biome自動修正付きチェック
```

### ビルド
```bash
npm run build  # 本番用ビルド
```

## データベース操作

```bash
# マイグレーション
npm run db:migrate              # 開発用マイグレーション
npm run db:migrate:sql-only     # SQLのみマイグレーション

# リセット・シード
npm run db:reset    # DBリセット
npm run db:seed     # シードデータ投入

# Supabase型生成
npm run supabase:db:type-gen
```

## システムコマンド（macOS）

### よく使用するコマンド
```bash
# ファイル・ディレクトリ操作
ls -la              # ファイル一覧（詳細）
find . -name "*.ts" # TypeScriptファイル検索
grep -r "pattern" src/  # パターン検索

# Git操作
git status
git add .
git commit -m "message"
git push origin branch-name

# プロセス管理
ps aux | grep node  # Nodeプロセス確認
kill -9 PID         # プロセス強制終了

# ネットワーク
lsof -i :5173      # ポート5173使用確認
```

### Docker操作
```bash
docker compose up -d    # バックグラウンド起動
docker compose down     # 停止・削除
docker compose logs     # ログ表示
docker ps              # コンテナ一覧
```