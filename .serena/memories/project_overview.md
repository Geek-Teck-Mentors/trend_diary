# プロジェクト概要

## プロジェクト名
trend_diary

## 目的
トレンド記事を管理・閲覧するWebアプリケーション。RSSパーサーを使用してトレンド記事を収集し、ユーザーが記事を管理できる機能を提供する。

## デプロイ構成
- **メインアプリケーション**: Cloudflare Workersにデプロイ
- **バックグラウンドジョブ**: Supabase Functionsで実行
- **データベース**: PostgreSQL（Supabaseで管理）

## 開発環境要件
- Node.js >= 22.0.0
- Docker実行環境（macOSの場合はOrbStack推奨）
- Supabase CLI

## アーキテクチャ方針
ドメイン駆動設計（DDD）とクリーンアーキテクチャの原則に基づいた設計を採用。

## CI/CD
- Lint: Biome CI + TypeScript型チェック
- Test: 多層テスト戦略（domain/api/client/storybook/e2e）
- CD: Cloudflare Workersへの自動デプロイ
- Prisma Schema チェック
- PR毎のCloudflareプレビュー環境自動デプロイ
