# 技術スタック

## ランタイム環境
- **Cloudflare Workers**: メインアプリケーションの実行環境
- **Supabase Functions**: バックグラウンドジョブの実行環境
- **Node.js**: 22.0.0以上

## フロントエンド
- **React Router v7**: ルーティングとSSR
- **React 18**: UIライブラリ
- **TailwindCSS v4**: スタイリング
- **shadcn/ui**: UIコンポーネントライブラリ
- **Radix UI**: アクセシブルなプリミティブコンポーネント
- **Lucide React**: アイコンライブラリ
- **next-themes**: テーマ管理
- **SWR**: データフェッチング
- **@tanstack/react-table**: テーブルコンポーネント

## バックエンド
- **Hono**: Webフレームワーク
- **hono-react-router-adapter**: React RouterとHonoの統合
- **@hono/zod-validator**: リクエストバリデーション

## データベース・ORM
- **PostgreSQL**: データベース
- **Prisma**: ORM
- **@prisma/extension-accelerate**: Prisma Accelerate拡張

## 認証・セッション管理
- **Supabase Auth**: 認証基盤
- **@supabase/ssr**: SSR対応のSupabaseクライアント
- **bcryptjs**: パスワードハッシュ化

## バリデーション
- **Zod**: スキーマバリデーション

## テスト
- **Vitest**: ユニット・統合テスト
- **Playwright**: E2Eテスト
- **@testing-library/react**: Reactコンポーネントテスト
- **Storybook**: UIコンポーネント開発・テスト
- **@vitest/coverage-v8**: カバレッジ計測
- **vitest-mock-extended**: モック拡張

## コード品質・ビルド
- **TypeScript**: 型安全性
- **Biome**: Linter & Formatter
- **Vite**: ビルドツール
- **Wrangler**: Cloudflare Workers CLI

## ログ・モニタリング
- **Pino**: 構造化ログ

## その他ライブラリ
- **rss-parser**: RSSフィード解析
- **uuid**: UUID生成
- **class-variance-authority**: バリアント管理
- **clsx / tailwind-merge**: クラス名管理
