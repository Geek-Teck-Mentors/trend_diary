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

### 必要なGitHub Secrets

リポジトリの Settings > Secrets and variables > Actions から以下のシークレットを設定する必要がある：

- `CLOUDFLARE_API_TOKEN`: Cloudflare APIトークン
  - [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens) から作成
  - 必要な権限: `Workers Scripts:Edit`

- `CLOUDFLARE_ACCOUNT_ID`: CloudflareアカウントID
  - [Cloudflare Dashboard](https://dash.cloudflare.com/) のWorkers & Pages画面で確認可能

### プレビュー環境の動作

- PR作成・更新時に自動的にプレビュー環境がデプロイされる
- デプロイURLはPRコメントに自動投稿される（例: `https://trend-diary-pr-123.{subdomain}.workers.dev`）
- プレビュー環境は本番のDBとAPIに接続する
- PRクローズ時に自動的にプレビュー環境が削除される

### プレビュー環境用の環境変数設定

Cloudflare Workersのプレビュー環境でも本番環境と同じ環境変数が必要な場合は、`wrangler secret put`コマンドで設定可能：

```sh
# プレビュー環境名を指定して環境変数を設定
npx wrangler secret put DATABASE_URL --name trend-diary-pr-123
```

ただし、`--keep-vars`オプションを使用しているため、基本的には本番環境と同じ環境変数が使用される。

## 他ドキュメント

[ホーム](docs/home.md)

## リファレンス

- [React Router](https://reactrouter.com/home)
- [React Router Hono Adapter](https://github.com/yusukebe/hono-react-router-adapter)
- [Hono](https://hono.dev/docs/)
- [TailwindCSS Using Vite](https://tailwindcss.com/docs/installation/using-vite)
- [Using Prisma on Cloudflare Workers](https://hono.dev/examples/prisma)
- [Claude Codeを10倍賢くする無料ツール「Serena」の威力とトークン効率化術](https://zenn.dev/sc30gsw/articles/ff81891959aaef)
