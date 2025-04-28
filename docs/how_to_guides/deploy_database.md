## 手順

1. SupabaseのDB接続で使う情報を取得（ORMsを参照）
2. `.env.production.local`にDIRECT_URLを追加
3. `npm run db:migrate:deploy`

### 注意

npx prisma migrate resetをすると、権限情報含めてリセットされてしまうため
リセットコマンドは実行しないように。
もしやらかしたら、以下の記事を参考にロール周りを復元する。

https://qiita.com/mziyut/items/66f9c3b342ffe17a0469
