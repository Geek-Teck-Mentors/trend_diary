# テスト戦略とパターン

## テスト構成（多層アーキテクチャ）

### 1. ドメイン層テスト
- **設定**: `vitest/config.domain.ts`
- **対象**: ドメインロジック・ビジネスルール
- **特徴**: モックPrismaクライアント使用
- **実行**: `npm run test:domain`

### 2. API層テスト  
- **設定**: `vitest/config.api.ts`
- **対象**: API エンドポイント・統合テスト
- **特徴**: 実際のデータベース使用
- **実行**: `npm run test:api`

### 3. フロントエンドテスト
- **設定**: `vitest/config.frontend.ts`
- **対象**: Reactコンポーネント・カスタムフック
- **特徴**: @testing-library/react使用
- **実行**: `npm run test:frontend`

### 4. Storybookテスト
- **設定**: `vitest/config.storybook.ts`
- **対象**: UIコンポーネントのビジュアルテスト
- **実行**: `npm run test-storybook`

### 5. E2Eテスト
- **フレームワーク**: Playwright
- **対象**: エンドツーエンドシナリオ
- **実行**: `npm run e2e`

## テストパターン

### モック戦略
- **Prismaクライアント**: `src/test/__mocks__/prisma.ts`（domainテストのみ）
- **API層**: 実データベース使用
- **外部API**: モック化

### ファイル命名規約
- `*.test.ts` - ユニット・統合テスト
- `*.stories.tsx` - Storybookテスト  
- `/test/e2e/` - E2Eテスト

### テストヘルパー
- `src/test/helper/` - 共通テストユーティリティ
- `src/test/setup.ts` - テスト環境設定
- `src/test/env.ts` - テスト用環境変数

## 実行方法
```bash
# 各層個別実行
npm run test:domain -- path/to/file
npm run test:api -- path/to/file  
npm run test:frontend -- path/to/file

# 全体実行
npm run test:domain
npm run test:api
npm run test:frontend
npm run test-storybook
npm run e2e
```