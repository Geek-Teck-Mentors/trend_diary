## ローカル環境でのテストのセットアップ

ローカルでのテストにおいて、必要な準備は以下。

1. `.env.test`の作成
2. `.env`の`DATABASE_URL`の値をテスト用のDBにする
3. マイグレーションの実行

### 1. `.env.test`の作成

[`.env.example`](/.env.example) を複製します。

```sh
cp .env.example .env.test
```

### 2. `.env`の`DATABASE_URL`の値をテスト用のDBにする

文字通りです。PostgreSQLのリンクの最後の部分、
データベース名を`test`にします。

### 3. マイグレーションの実行

```sh
npm run db:migrate
```
