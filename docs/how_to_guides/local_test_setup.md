## ローカル環境でのテストのセットアップ

ローカルでのテストにおいて、必要な準備は以下。

1. `.dev.vars.test`の作成
2. `.dev.vars.test`の`DATABASE_URL`の値をテスト用のDBにする
3. マイグレーションの実行

### 1. `.dev.vars.test`の作成

[`.dev.vars.example`](/.dev.vars.example) を複製します。

```sh
cp .dev.vars.example .dev.vars.test
```

### 2. `.dev.vars.test`の`DATABASE_URL`の値をテスト用のDBにする

文字通りです。PostgreSQLのリンクの最後の部分、
データベース名を`test`にします。

### 3. マイグレーションの実行

```sh
npm run db:migrate
```
