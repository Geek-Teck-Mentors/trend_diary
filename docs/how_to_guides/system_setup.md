## 環境構築

### 必要なもの

- Node
- Docker

### 手順

Nodeモジュールのインストール

```sh
npm ci
```

DockerのDBを起動

```sh
docker compose up
```

Docker上のDBにマイグレーションを適用

```sh
npm run db:migrate
```

サーバの起動（Hono上でAPIとRemixが起動する）

```sh
npm run dev
```
