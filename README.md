[![Lint](https://github.com/Geek-Teck-Mentors/trend_diary/actions/workflows/lint.yaml/badge.svg)](https://github.com/Geek-Teck-Mentors/trend_diary/actions/workflows/lint.yaml)
[![Test](https://github.com/Geek-Teck-Mentors/trend_diary/actions/workflows/test.yaml/badge.svg?branch=main)](https://github.com/Geek-Teck-Mentors/trend_diary/actions/workflows/test.yaml)
[![CD](https://github.com/Geek-Teck-Mentors/trend_diary/actions/workflows/cd.yaml/badge.svg)](https://github.com/Geek-Teck-Mentors/trend_diary/actions/workflows/cd.yaml)
[![Check Prisma Schema](https://github.com/Geek-Teck-Mentors/trend_diary/actions/workflows/check_prisma.yaml/badge.svg)](https://github.com/Geek-Teck-Mentors/trend_diary/actions/workflows/check_prisma.yaml)
[![Functions CI](https://github.com/Geek-Teck-Mentors/trend_diary/actions/workflows/functions_ci.yaml/badge.svg)](https://github.com/Geek-Teck-Mentors/trend_diary/actions/workflows/functions_ci.yaml)

## 環境構築

### 必要なもの

- ローカルでのNodeの実行環境
- Docker実行環境（Macの場合はOrbStack推奨）

### 手順

Nodeモジュールのインストール

```sh
npm ci
```

環境変数ファイルをコピー(Cloudflareでは.{env}.vars)
```sh
cp .dev.vars.example .dev.vars
```

DockerのDBを起動

```sh
docker compose up -d
```

Docker上のDBにマイグレーションを適用

```sh
npm run db:migrate
```

サーバの起動（Hono上でAPIとRemixが起動する）

```sh
npm start
```

## Cloudflare Preview環境の設定

このプロジェクトではPR毎にCloudflare Workersのプレビュー環境を自動デプロイする仕組みを導入している。

**安全性**: `wrangler versions upload`を使用しているため、本番環境には一切影響しない。

### 必要なGitHub Secrets

リポジトリの Settings > Secrets and variables > Actions から以下のシークレットを設定する必要がある：

- `CLOUDFLARE_API_TOKEN`: Cloudflare APIトークン
  - [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens) から作成
  - 必要な権限: `Workers Scripts:Edit`

- `CLOUDFLARE_ACCOUNT_ID`: CloudflareアカウントID
  - [Cloudflare Dashboard](https://dash.cloudflare.com/) のWorkers & Pages画面で確認可能

### プレビュー環境の動作

- PR作成・更新時に新しいWorkerバージョンをアップロード（本番デプロイはしない）
- プレビューエイリアス（例: `pr-123`）を自動作成
- プレビューURLはPRコメントに自動投稿（例: `https://pr-123.trend-diary.workers.dev`）
- プレビュー環境は本番のDBとAPIに接続する
- PRクローズ時にCloudflare APIを使ってプレビューデプロイメントを自動削除

### 技術詳細

**デプロイ方法**:
Cloudflare公式の`wrangler versions upload`コマンドを使用：
```sh
# 新しいバージョンをアップロード（本番デプロイしない）
npx wrangler versions upload --preview-alias pr-123
```

これにより：
- 本番Workerには影響なし
- 新しいWorkerを作成しない（バージョン管理の一部）
- プレビューエイリアスのみ作成
- セキュアかつCloudflare推奨の方法

**クリーンアップ方法**:
PRクローズ時にCloudflare APIを使用してデプロイメントを削除：
```sh
# デプロイメント一覧を取得
GET /accounts/{account_id}/workers/scripts/trend-diary/deployments

# プレビューエイリアスに一致するデプロイメントを削除
DELETE /accounts/{account_id}/workers/scripts/trend-diary/deployments/{deployment_id}
```

**ワークフロー構成**:
- 既存の`.github/actions/setup_node`アクションを使用
- Node.jsバージョンは`.node-version`ファイルから自動読み取り
- 他のワークフローと同じパターンで統一

## 他ドキュメント

[ホーム](docs/home.md)

## リファレンス

- [React Router](https://reactrouter.com/home)
- [React Router Hono Adapter](https://github.com/yusukebe/hono-react-router-adapter)
- [Hono](https://hono.dev/docs/)
- [TailwindCSS Using Vite](https://tailwindcss.com/docs/installation/using-vite)
- [Using Prisma on Cloudflare Workers](https://hono.dev/examples/prisma)
- [Claude Codeを10倍賢くする無料ツール「Serena」の威力とトークン効率化術](https://zenn.dev/sc30gsw/articles/ff81891959aaef)
