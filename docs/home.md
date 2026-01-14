## ホーム

- [プロダクトゴール](product_goal.md)
- [グランドルール](grand_rule.md)
- [開発ルール](development_rule.md)
- [ドキュメントルール](docs_rule.md)
- [ADR](adr/0_top.md)
- [ハウツーガイド](how_to_guides/0_top.md)
- [システム構成](system_config/config.md)

## ディレクトリ構成

```sh
./src
├── web # アプリケーション層
│   ├── server # Hono API
│   │   ├── admin # 管理者API
│   │   ├── article # 記事API
│   │   ├── policy # ポリシーAPI
│   │   ├── user # ユーザーAPI
│   │   ├── v2 # API v2
│   │   └── route.ts
│   ├── middleware # ミドルウェア
│   │   ├── authenticator.ts
│   │   ├── errorHandler.ts
│   │   ├── requestLogger.ts
│   │   └── zodValidator.ts
│   ├── worker.ts # Cloudflare Workersエントリーポイント
│   ├── server.ts # アプリケーションサーバ
│   ├── env.ts
│   └── client # React Router v7 フロントエンド
│       ├── components # 共通コンポーネント
│       ├── features # 機能別コンポーネント
│       ├── hooks # カスタムフック
│       ├── routes # ページルート
│       └── infrastructure # フロントエンド用インフラ
├── common # src配下で共通使用するもの
│   ├── errors # エラー型定義
│   ├── locale # 地域化・日付処理
│   ├── pagination # ページネーション
│   ├── sanitization # サニタイゼーション
│   ├── types # 共通型定義
│   ├── logger.ts # ロガー
│   └── schemas.ts # 共通スキーマ
├── domain # ドメイン層（DDD）
│   ├── admin # 管理者集約
│   ├── article # 記事集約
│   ├── auth-v2 # 認証v2集約
│   ├── policy # ポリシー集約
│   └── user # ユーザー集約
│       ├── index.ts # 集約エクスポート、factory
│       ├── infrastructure # リポジトリ実装
│       ├── schema # バリデーションスキーマ
│       ├── repository.ts # リポジトリインターフェース
│       └── useCase.ts # ビジネスロジック
├── infrastructure # インフラストラクチャ層
│   ├── notification # 通知機能
│   ├── prisma-orm # Prisma ORM設定
│   │   ├── models # Prismaモデル
│   │   ├── migrations # マイグレーション
│   │   └── main.prisma
│   ├── rdb.ts # RDB接続
│   └── supabase.ts # Supabase接続
├── test # テスト関連
│   ├── __mocks__ # モック
│   ├── e2e # E2Eテスト
│   ├── helper # テストヘルパー
│   └── vitest # Vitest設定
├── plugin # カスタムプラグイン
```

環境変数は.dev.vars.exampleファイルを参考に与える。

テストファイルの配置は以下のルールに従う:
- ユニットテスト（`*.test.ts`）: 実装されているコードと同じ階層に配置
- E2Eテスト: `src/test/e2e`に配置
- テストヘルパー: `src/test/helper`に配置
- テストモック: `src/test/__mocks__`に配置（ドメイン層テストで使用）
- Vitest設定: `src/test/vitest/config`に配置
