# システムコマンド（macOS Darwin）

## 基本コマンド
- `git` - `/usr/bin/git` - バージョン管理
- `ls` - `/bin/ls` - ファイル一覧表示
- `grep` - `/usr/bin/grep` - テキスト検索
- `find` - `/usr/bin/find` - ファイル検索
- `cd` - シェル組み込みコマンド - ディレクトリ移動

## 開発環境
- **Node.js**: >=22.0.0
- **Docker**: 必須（Macの場合はOrbStack推奨）
- **データベース**: PostgreSQL (Docker Compose経由)

## 環境構築コマンド
```bash
# 依存関係インストール
npm ci

# Docker DB起動
docker compose up -d

# 環境変数設定
cp .dev.vars.example .dev.vars
cp .dev.vars.example .env

# DBマイグレーション
npm run db:migrate

# 開発サーバー起動
npm run dev
```

## macOS特有の注意点
- FinderやSpotlightの干渉を避けるため、`.gitignore`の設定重要
- Dockerの代わりにOrbStackが推奨されている
- システムのgrepよりもripgrepの使用が推奨される場合あり