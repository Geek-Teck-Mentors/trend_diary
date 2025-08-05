# プロジェクト概要

## プロジェクトの目的
trend_diaryは**トレンド記事収集・管理アプリケーション**で、ユーザーがトレンド記事を読み、管理できるWebアプリケーション。プライバシーポリシー管理機能も含む。

## 技術スタック

### ランタイム・デプロイ
- **Cloudflare Workers** (メインアプリ)
- **Supabase Functions** (バックグラウンドジョブ)

### バックエンド
- **Hono** (ウェブフレームワーク)
- **React Router** (React Router v7)
- **PostgreSQL + Prisma ORM**

### フロントエンド
- **React Router v7 + React**
- **TailwindCSS v4**
- **shadcn/ui**
- **Next Themes** (ダークモード)

### テスト・開発ツール
- **Vitest** (テストフレームワーク、5つの設定ファイル)
- **Playwright** (E2Eテスト)
- **Storybook** (UIコンポーネント開発)
- **Biome** (Linter + Formatter)
- **TypeScript**

### その他
- **Pino** (ロガー)
- **Zod** (バリデーション)
- **SWR** (データフェッチング)

## アーキテクチャ
ドメイン駆動設計（DDD）とクリーンアーキテクチャに基づく構成。関数型エラーハンドリング（Result<T, E>型）を採用。