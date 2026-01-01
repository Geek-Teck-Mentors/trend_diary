## 基本ルール

- 必ず日本語で回答すること
- 敬語は使用しないこと

### レビュー
レビューする際には、以下のprefix(接頭辞)をつけてください
- [must] → かならず変更してね
- [imo] → 自分の意見だとこうだけど修正必須ではないよ(in my opinion)
- [nits] → ささいな指摘(nitpick)
- [ask] → 質問
- [fyi] → 参考情報

## ドキュメント参照

詳細な開発ルールやアーキテクチャ情報は以下のドキュメントを参照すること。

- **[ホーム](../docs/home.md)** - プロジェクト全体のドキュメント目次とディレクトリ構成
- **[開発ルール](../docs/development_rule.md)** - 開発フロー、コミット規約、開発コマンド、重要な規約
- **[ADR](../docs/adr/0_top.md)** - アーキテクチャ決定記録
  - [エラーハンドリング](../docs/adr/20250609_error_as_valueの運用.md)
  - [テスト戦略](../docs/adr/20250523_テスト戦略.md)
- **[ハウツーガイド](../docs/how_to_guides/0_top.md)** - 各種セットアップガイド

**技術スタック概要:**

- ランタイム: Cloudflare Workers + Supabase Functions
- バックエンド: Hono + React Router v7
- フロントエンド: React + TailwindCSS v4 + shadcn/ui
- データベース: PostgreSQL + Prisma ORM
- テスト: Vitest + Playwright
- コード品質: Biome + TypeScript
