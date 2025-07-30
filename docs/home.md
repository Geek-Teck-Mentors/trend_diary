## ホーム

- [プロダクトゴール](product_goal.md)
- [グランドルール](grand_rule.md)
- [開発ルール](development_rule.md)
- [ドキュメントルール](docs_rule.md)
- [ADR](adr/0_top.md)
- [スクラムルール](scrum_rule.md)
- [ハウツーガイド](how_to_guides/0_top.md)
- [システム構成](system_config/config.md)

## ディレクトリ構成

```sh
./src
├── application # 今回作成するアプリケーションサーバ用のディレクトリ
│   ├── api # hono api
│   ├── env.ts
│   ├── middleware
│   ├── server.ts # アプリケーションを起動するサーバ
│   └── web # Remix Frontend
├── common # src配下のディレクトリ間で共通使用するものを入れる
├── domain # DDDにおけるドメインと同じ
│   └── account
│       ├── index.ts # package外で使用できるクラスなどをexport
│       ├── infrastructure # repositoryの実装詳細
│       ├── model
│       ├── repository # リポジトリインターフェース
│       ├── schema # バリデーションスキーマ
│       └── service
├── infrastructure # インフラ関連. 永続化層との接続などネットワーク的な意味合いが強い
│   └── rdb.ts
└── logger
    └── logger.ts
```

環境変数は.dev.vars.exampleファイルを参考に与える。
テストファイルは`test`というフォルダを切らず、実装されているコードと同じ階層に置くものとする。
