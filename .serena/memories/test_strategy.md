# Test Strategy

## テスト戦略概要

このプロジェクトは多層テスト戦略を採用している。各層で異なるVitest設定を使用し、適切なレベルでのテストを実現している。

## 各層のテスト設定

### 1. ドメイン層テスト
- **設定ファイル**: `vitest/config.domain.ts`
- **実行コマンド**: `npm run test:domain`
- **特徴**: モックPrismaクライアントを使用したユニットテスト
- **対象**: ドメインロジック、ユースケース、エンティティ
- **モック設定**: `src/test/__mocks__/prisma.ts`

### 2. API層テスト
- **設定ファイル**: `vitest/config.api.ts`
- **実行コマンド**: `npm run test:api`
- **特徴**: 実際のデータベースを使用した統合テスト
- **対象**: API エンドポイント、ミドルウェア、リポジトリ実装

### 3. フロントエンドテスト
- **設定ファイル**: `vitest/config.frontend.ts`
- **実行コマンド**: `npm run test:frontend`
- **対象**: React コンポーネント、フック、フロントエンド機能
- **ライブラリ**: `@testing-library/react`, `@testing-library/user-event`

### 4. Storybookテスト
- **設定ファイル**: `vitest/config.storybook.ts`
- **実行コマンド**: `npm run test-storybook`
- **対象**: UIコンポーネントのビジュアルテスト、インタラクションテスト

### 5. E2Eテスト
- **フレームワーク**: Playwright
- **実行コマンド**: `npm run e2e`
- **対象**: エンドツーエンドシナリオ
- **設定**: `playwright.config.ts`
- **baseURL**: `http://localhost:5173`

## テスト実行パターン

### 個別テスト実行
```bash
# 特定のファイルをテスト
npm run test:domain -- src/domain/user/useCase.test.ts
npm run test:api -- src/application/api/user/login.test.ts
npm run test:frontend -- src/application/web/components/Button.test.ts

# パターンマッチでテスト
npm run test:domain -- --run user
```

### デバッグ・開発時
```bash
# ウォッチモード（設定によってはデフォルト）
npm run test:domain -- --watch

# カバレッジ付き実行
npm run test:api -- --coverage
```

### CI/CD環境
```bash
# 全テスト実行（推奨順序）
npm run test:domain   # ドメインテスト（高速）
npm run test:frontend # フロントエンドテスト
npm run test:api      # API統合テスト
npm run test-storybook # Storybookテスト
npm run e2e           # E2Eテスト（最後）
```

## テストファイル命名規則

### ファイル配置
- 実装ファイルと同じディレクトリに配置
- 例: `src/domain/user/useCase.ts` → `src/domain/user/useCase.test.ts`

### テストケース記載ルール
- 仕様をテストコードに記載する
- コードを書く前にテストケース名を記載（TDD推奨）
- describeブロックで機能をグループ化
- itブロックで具体的なテストケースを記載

## モック・テストヘルパー

### Prismaモック
- **場所**: `src/test/__mocks__/prisma.ts`
- **使用場所**: ドメインテストのみ
- **ライブラリ**: `vitest-mock-extended`

### テストヘルパー
- **場所**: `src/test/helper/`
- **種類**: 
  - `articleTestHelper.ts`: 記事関連テストヘルパー
  - `adminUserTestHelper.ts`: 管理者ユーザーテストヘルパー
  - `activeUserTestHelper.ts`: アクティブユーザーテストヘルパー
  - `policyTestHelper.ts`: ポリシー関連テストヘルパー

### セットアップファイル
- **場所**: `src/test/setup.ts`
- **環境設定**: `src/test/env.ts`

## E2Eテスト詳細

### ページオブジェクト
- **場所**: `src/test/e2e/page/`
- **例**: `trends._index.test.ts`

### シナリオテスト
- **場所**: `src/test/e2e/scenario/`

### Playwright設定
```bash
# テスト実行
npm run e2e

# レポート表示
npm run e2e:report

# コード生成ツール
npm run e2e:gen
```