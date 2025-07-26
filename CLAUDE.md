# CLAUDE.md

- 必ず日本語で回答すること
- 敬語は使用しないこと
- 必ず t-wada のTDDで進めること
- リファクタリング時は必ずlint, format, testコマンドを実行すること

このファイルはClaude Code (claude.ai/code) がこのリポジトリで作業する際のガイダンスを提供する。

## 開発フロー

#### 🔄 コミット（サイクル完了時必須）

```bash
# 1. 全テスト実行で確認
npm run test:service && npm run test:api

# 2. コード品質チェック
npm run lint:ci

# 3. 全て成功後にコミット（Conventional Commitsに従う）
git add .
git commit -m "[type]: [機能名] TDD cycle complete

🔴 RED: [テスト内容]
🟢 GREEN: [実装内容]
🔵 REFACTOR: [改善内容]"
```

**コミットタイプ（Conventional Commits）:**

- `feat:` - 新機能追加
- `fix:` - バグ修正
- `refactor:` - リファクタリング（機能変更なし）
- `test:` - テスト追加・修正
- `docs:` - ドキュメント更新
- `style:` - コードスタイル修正（フォーマット等）
- `perf:` - パフォーマンス改善
- `chore:` - ビルドプロセス・補助ツール等の変更

**使用例:**

```bash
# 新機能の場合
git commit -m "feat: add user authentication TDD cycle complete"

# バグ修正の場合
git commit -m "fix: resolve login validation issue TDD cycle complete"

# リファクタリングの場合
git commit -m "refactor: improve article service structure TDD cycle complete"
```

RED-GREEN-REFACTORを1サイクルとして繰り返す

### テスト実行順序

- 単体テスト (service層) → 統合テスト (api層) → E2Eテスト
- 各層のテストが通ってから次の層へ進む

## テスト作成ガイドライン

### 必須テスト構造

**サービス層・API層**では必ず以下の3段階構造でテストを作成すること：

#### 3段階テスト構造（必須）

**1. 正常系** (`describe('正常系')`)
- 期待通りの動作をするケース
- 成功パス、ハッピーパスのテスト
- レスポンス内容とステータスコードの確認

**2. 準正常系** (`describe('準正常系')`)
- バリデーションエラー、リソース不存在など予期されるエラー
- クライアントの入力ミスや業務ルール違反
- HTTPステータス: 400, 404, 422など

**3. 異常系** (`describe('異常系')`)
- システムエラー、DBエラーなど予期しないエラー
- インフラ障害やシステム異常
- HTTPステータス: 500, 503など

### 層別テストテンプレート

#### サービス層テストテンプレート

```typescript
describe('ServiceName', () => {
  describe('methodName', () => {
    describe('正常系', () => {
      it('具体的な成功ケース', async () => {
        // モック設定
        mockRepository.method.mockResolvedValue(mockData)
        
        const result = await service.method(params)
        
        expect(result).toEqual(resultSuccess(expectedData))
      })
    })
    
    describe('準正常系', () => {
      it('既に存在するリソース', async () => {
        mockRepository.findUnique.mockResolvedValue(existingData)
        
        const result = await service.method(params)
        
        expect(result).toEqual(resultError(new AlreadyExistsError('Resource already exists')))
      })
      
      it('存在しないリソース', async () => {
        mockRepository.findUnique.mockResolvedValue(null)
        
        const result = await service.method(params)
        
        expect(result).toEqual(resultError(new NotFoundError('Resource not found')))
      })
    })
    
    describe('異常系', () => {
      it('異常系: 意図しないDBエラー', async () => {
        mockRepository.method.mockRejectedValue(new Error('Database error'))
        
        const result = await service.method(params)
        
        expect(result).toEqual(resultError(new ServerError('Database error')))
      })
    })
  })
})
```

#### API層テストテンプレート

```typescript
describe('HTTP_METHOD /api/path', () => {
  describe('正常系', () => {
    it('正常な処理が成功する', async () => {
      const response = await app.request('/api/path', {
        method: 'POST',
        body: JSON.stringify(validData)
      })
      
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toBeDefined()
    })
  })
  
  describe('準正常系', () => {
    const testCases = [
      {
        name: '不正な形式のパラメータ',
        input: { invalidField: 'invalid' },
        status: 422,
      },
      {
        name: '存在しないリソース',
        input: { id: 'nonexistent' },
        status: 404,
      },
    ]
    
    testCases.forEach((testCase) => {
      it(testCase.name, async () => {
        const response = await app.request('/api/path', {
          method: 'POST',
          body: JSON.stringify(testCase.input)
        })
        
        expect(response.status).toBe(testCase.status)
      })
    })
  })
  
  describe('異常系', () => {
    it('異常系: データベース接続エラー', async () => {
      // データベース接続を切断するなどのセットアップ
      
      const response = await app.request('/api/path', {
        method: 'POST',
        body: JSON.stringify(validData)
      })
      
      expect(response.status).toBe(500)
    })
  })
})
```

### テストケース命名規約

#### 正常系
- 具体的な動作を説明
- 例: `it('ユーザー登録に成功する', async () => {})`
- 例: `it('記事検索結果を取得できる', async () => {})`

#### 準正常系
- エラー内容を明記
- 例: `it('不正なメールアドレス', async () => {})`
- 例: `it('存在しないarticle_id', async () => {})`

#### 異常系
- `異常系: 具体的なエラー種類`で開始
- 例: `it('異常系: 意図しないDBエラー', async () => {})`
- 例: `it('異常系: ネットワーク接続エラー', async () => {})`

### HTTPステータスコード対応表

| 系統 | ステータスコード | 説明 | 使用場面 |
|------|----------------|------|----------|
| 正常系 | 200 | OK | 正常な取得・更新 |
| 正常系 | 201 | Created | 正常な作成 |
| 正常系 | 204 | No Content | 正常な削除 |
| 準正常系 | 400 | Bad Request | リクエスト形式エラー |
| 準正常系 | 404 | Not Found | リソース不存在 |
| 準正常系 | 422 | Unprocessable Entity | バリデーションエラー |
| 異常系 | 500 | Internal Server Error | サーバー内部エラー |
| 異常系 | 503 | Service Unavailable | サービス利用不可 |

### セットアップ・クリーンアップパターン

#### サービス層（モック使用）
```typescript
beforeEach(() => {
  vi.clearAllMocks()  // vitestモックをリセット
})
```

#### API層（実DB使用）
```typescript
beforeAll(() => {
  db = getRdbClient(TEST_ENV.DATABASE_URL)
})

beforeEach(async () => {
  await testHelper.cleanUp()
  await setupTestData()
})

afterAll(async () => {
  await testHelper.cleanUp()
  await db.$disconnect()
})
```

### テーブル駆動テストパターン

準正常系でのバリデーションテストには配列を活用：

```typescript
const testCases = [
  {
    name: '不正なメールアドレス',
    input: { email: 'invalid-email' },
    status: 422,
  },
  {
    name: '必須フィールド不足',
    input: { email: '' },
    status: 422,
  },
]

testCases.forEach((testCase) => {
  it(testCase.name, async () => {
    // テスト実行
  })
})
```

## フロントエンドテストガイドライン

### Storybookテスト

### フロントエンドテスト分類

#### API接続なし（Storybook推奨）
- **対象**: 純粋UIコンポーネント、ユーティリティ関数
- **テストツール**: Storybook + vitest
- **特徴**: モックなしでテスト可能

#### API接続あり（Playwright推奨）
- **対象**: フォーム送信、データフェッチコンポーネント
- **テストツール**: Playwright E2E
- **特徴**: 実際のAPI通信をテスト

## 開発コマンド

### ビルドとデプロイ

- `npm run dev` - Remixで開発サーバーを起動
- `npm run build` - 本番用ビルド

### テスト

- `npm run test:service` - ドメイン/サービス層のテストを実行
- `npm run test:api` - API層のテストを実行
- `npm run test:frontend` - フロントエンドコンポーネントのテストを実行
- `npm run test-storybook` - Storybookのテストを実行
- `npm run e2e` - PlaywrightでE2Eテストを実行
- `npm run e2e:report` - PlaywrightのHTMLレポートを表示
- `npm run e2e:gen` - Playwrightのコード生成ツールを起動
- 個別テストファイルは 各種適切なコマンドで`-- <path/to/file>`で実行可能

### Storybook

- `npm run storybook` - Storybookを開発モードで起動
- `npm run build-storybook` - Storybookをビルド

### データベース

- `npm run db:gen` - Prisma型生成
- `npm run db:migrate` - Prismaマイグレーション実行（開発用）
- `npm run db:migrate:sql-only` - SQLのみのマイグレーション実行
- `npm run db:migrate:deploy` - 本番用マイグレーション実行
- `npm run db:reset` - データベースリセット
- `npm run db:studio` - Prisma Studio起動
- `npm run supabase:db:type-gen` - Supabase型生成

### コード品質

- `npm run lint` - Biomeでlintを実行
- `npm run lint:fix` - Biomeでlintを自動修正付きで実行
- `npm run check-types` - TypeScript型チェックを実行
- `npm run format` - Biomeでコードフォーマットをチェック
- `npm run format:fix` - Biomeでコードフォーマットを修正
- `npm run check` - Biomeで総合チェック
- `npm run check:fix` - Biomeで総合チェック・修正
- `npm run lint:ci` - biome ci実行 + 型チェック（基本的にこれを使用する）

## 開発環境設定

### ローカル開発サーバー

- **開発サーバー**: `http://localhost:5173` (Vite + Remix)
- **Storybook**: `http://localhost:6006` (UIコンポーネント開発)
- **E2Eテスト**: `http://localhost:5173` (Playwright baseURL)

### 環境変数

必要な環境変数については`.dev.vars.example`を参照すること

## アーキテクチャ概要

これは**ドメイン駆動設計（DDD）**とクリーンアーキテクチャの原則に基づく、**Cloudflare Workers + Supabase Functions**のハイブリッド構成でデプロイされるアプリケーション。

### 主要なアーキテクチャパターン

**エラーハンドリング**: 関数型エラーハンドリングパターンを使用

- サービス層は`Result<T, E>`型を返す（`src/common/types/utility.ts`で定義）
- 非同期処理では`AsyncResult<T, E>`型を使用
- エラーハンドリングヘルパー関数を活用:
  - `resultSuccess<T>(value: T)`: 成功結果を作成
  - `resultError<T, E>(error: E)`: エラー結果を作成
  - `isSuccess<T, E>(result)`: 成功かどうかを判定
  - `isError<T, E>(result)`: エラーかどうかを判定
- カスタムエラー型は`src/common/errors/`に定義:
  - `ClientError`: クライアントエラー（400系）
  - `ServerError`: サーバーエラー（500系）
  - `NotFoundError`: リソースが見つからない
  - `AlreadyExistsError`: リソースが既に存在
- API層では`handleError`関数でHTTPExceptionに変換
- utilsの作成は禁止

**ドメイン層構造**:

```
src/domain/{aggregate}/
├── factory/         # ドメインサービスファクトリ
├── model/           # ドメインエンティティ
├── service/         # ドメインビジネスロジック
├── repository/      # リポジトリインターフェース
├── schema/          # Zodバリデーションスキーマ
├── infrastructure/  # リポジトリ実装
└── index.ts         # 集約エクスポート
```

**テスト戦略**（多層構造）:

- **サービス層**: `vitest/config.service.ts`でモックPrismaクライアントを使用したユニットテスト
- **API層**: `vitest/config.api.ts`で実際のデータベースを使用した統合テスト
- **フロントエンド**: `vitest/config.frontend.ts`でコンポーネントとフックのテスト
- **Storybook**: `vitest/config.storybook.ts`でUIコンポーネントのビジュアルテスト
- **E2Eテスト**: エンドツーエンドシナリオのPlaywrightテスト

### 技術スタック

**ランタイム**: Cloudflare Workers（メインアプリ）+ Supabase Functions（バックグラウンドジョブ）
**バックエンド**: HonoウェブフレームワークとRemixアダプター
**フロントエンド**: Remix + React + TailwindCSS v4 + shadcn/ui
**データベース**: PostgreSQL + Prisma ORM
**テスト**: 各層で個別設定のVitest + Playwright E2E
**ビルドツール**: Vite
**コード品質**: Biome + TypeScript

### エントリーポイント

- **メインアプリケーション**: `/functions/[[path]].ts`（Cloudflare Workersエントリー）
- **開発サーバー**: `/src/application/server.ts`（Hono + Remix）
- **バックグラウンドジョブ**: `/supabase/functions/*/index.ts`

### データベーススキーマ

Prismaモデルは`prisma/models/`内のファイルに分割:

- `user.prisma` - ユーザー管理
- `account.prisma` - アカウント管理
- `session.prisma` - セッション管理
- `article.prisma` - 記事集約システム
- 全モデルは統一されたID/タイムスタンプパターンでベーススキーマを拡張

### 重要な規約

**インポート**: `src/`ルートからの絶対インポートを使用（TypeScript path mapping: `@/*`）
**エラーハンドリング**: サービス層では`Result<T, E>`型を使用し、API層でHTTPExceptionに変換
**テスト**: `src/test/__mocks__/prisma.ts`でPrismaクライアントをモック, serviceテストのみで利用
**バリデーション**: データ検証にドメイン層のZodスキーマを使用
**ログ**: Pinoロガーで構造化ログを使用

**API層バリデーション**: 全てのAPI層エンドポイントで`zodValidator`の使用が必須

- **必須ルール**: 全APIエンドポイントでリクエストデータのバリデーションにzodValidatorを使用する
- **バリデーション対象**: 
  - `query`: クエリパラメータのバリデーション
  - `param`: パスパラメータのバリデーション  
  - `json`: リクエストボディのバリデーション
- **エラーハンドリング**: バリデーション失敗時は自動的に422ステータスで返却
- **型安全性**: `ZodValidatedContext`系の型を使用してハンドラー関数で型安全にデータアクセス

**使用例**:
```typescript
// route.ts
import zodValidator from '@/application/middleware/zodValidator'
import { articleIdParamSchema, createReadHistoryApiSchema } from '@/domain/article'

const app = new Hono<Env>()
  .post(
    '/:article_id/read',
    authenticator,
    zodValidator('param', articleIdParamSchema),     // パスパラメータ検証
    zodValidator('json', createReadHistoryApiSchema), // リクエストボディ検証
    readArticle,
  )

// handler.ts
import { ZodValidatedParamJsonContext } from '@/application/middleware/zodValidator'

export default async function readArticle(
  c: ZodValidatedParamJsonContext<ArticleIdParam, CreateReadHistoryApiInput>,
) {
  // 型安全にバリデーション済みデータを取得
  const param = c.req.valid('param')  // ArticleIdParam型
  const body = c.req.valid('json')    // CreateReadHistoryApiInput型
  
  const { article_id: articleId } = param
  const { read_at: readAt } = body
  
  // 処理続行...
}
```

**バリデーション順序**: authenticator → zodValidator(param) → zodValidator(json) → handler

### コード品質設定詳細

**Biome設定**:

- Airbnb風の厳格なルールを統合適用
- lintとformatを一元管理
- アクセシビリティルールを強化
- TypeScript完全対応
- シングルクォート使用
- 行幅: 100文字
- セキュリティルール適用
- UI コンポーネントディレクトリは除外

**TypeScript設定**:

- strict モード有効
- パス解決: `@/*` → `./src/*`
- ESNext ターゲット
