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

DockerのDBを起動

```sh
docker compose up -d
```

Docker上のDBにマイグレーションを適用

```sh
# 環境変数のコピー, Cloudflareでは.{env}.vars
cp .dev.vars.example .dev.vars
# prismaが読むように.envを作成
cp .dev.vars.example .env
npm run db:migrate
```

サーバの起動（Hono上でAPIとRemixが起動する）

```sh
npm run dev
```

## 他ドキュメント

[ホーム](docs/home.md)

## リファレンス

- [React Router](https://reactrouter.com/home)
- [React Router Hono Adapter](https://github.com/yusukebe/hono-react-router-adapter)
- [Hono](https://hono.dev/docs/)
- [TailwindCSS Using Vite](https://tailwindcss.com/docs/installation/using-vite)
- [Using Prisma on Cloudflare Workers](https://hono.dev/examples/prisma)
