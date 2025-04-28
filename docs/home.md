## ホーム

- [プロダクトゴール](product_goal.md)
- [グランドルール](grand_rule.md)
- [開発ルール](development_rule.md)
- [ドキュメントルール](docs_rule.md)
- [ADR](adr/0_top.md)
- [スクラムルール](scrum_rule.md)
- [チュートリアル](tutorials/0_top.md)
- [ハウツーガイド](how_to_guides/0_top.md)
- [システム構成](system_config/config.md)

## ディレクトリ構成

```sh
./src
├── application # 今回作成するアプリケーションサーバ用のディレクトリ
│   ├── api
│   ├── env.ts
│   ├── middleware
│   ├── server.ts
│   └── web
├── common # src配下のディレクトリ間で共通使用するものを入れる
│   ├── baseModel.ts
│   ├── baseSchema.ts
│   ├── errors
│   ├── test
│   └── typeUtility.ts
├── domain # DDDにおけるドメインと同じ
│   ├── account
│   ├── repository # リポジトリ層の詳細な実装
│   └── user
├── infrastructure # インフラ関連. 永続化層との接続などネットワーク的な意味合いが強い
│   └── rdb.ts
└── logger
    └── logger.ts
```
