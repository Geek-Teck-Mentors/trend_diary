# アーキテクチャパターンとガイドライン

## アーキテクチャ概要

このプロジェクトは**ドメイン駆動設計（DDD）**と**クリーンアーキテクチャ**の原則に基づいて設計されている。

### レイヤー構造

```
┌─────────────────────────────────────┐
│   Presentation Layer                │
│   (API / Web)                       │
│   src/application/                  │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│   Domain Layer                      │
│   (Business Logic)                  │
│   src/domain/                       │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│   Infrastructure Layer              │
│   (Database / External Services)    │
│   src/infrastructure/               │
└─────────────────────────────────────┘
```

---

## エラーハンドリングパターン

### 関数型エラーハンドリング

**定義場所**: `src/common/types/utility.ts`

プロジェクト全体で`Result<T, E>`型を使用した関数型エラーハンドリングパターンを採用。

```typescript
type Result<T, E> = 
  | { success: true; value: T }
  | { success: false; error: E }

type AsyncResult<T, E> = Promise<Result<T, E>>
```

### ヘルパー関数

```typescript
// 成功結果を作成
resultSuccess<T>(value: T): Result<T, never>

// エラー結果を作成
resultError<E>(error: E): Result<never, E>

// 成功かどうかを判定
isSuccess<T, E>(result: Result<T, E>): boolean

// エラーかどうかを判定
isError<T, E>(result: Result<T, E>): boolean
```

### カスタムエラー型

**定義場所**: `src/common/errors/`

- `ClientError`: クライアントエラー（400系）
- `ServerError`: サーバーエラー（500系）
- `NotFoundError`: リソースが見つからない
- `AlreadyExistsError`: リソースが既に存在

### 使用方法

**ドメイン層**:
```typescript
// UseCaseはResult型を返す
async execute(): AsyncResult<Article, NotFoundError> {
  const article = await repository.findById(id)
  if (!article) {
    return resultError(new NotFoundError())
  }
  return resultSuccess(article)
}
```

**API層**:
```typescript
// handleError関数でHTTPExceptionに変換
const result = await useCase.execute()
if (isError(result)) {
  throw handleError(result.error)
}
return c.json(result.value)
```

---

## ドメイン駆動設計（DDD）パターン

### 集約（Aggregate）

各ドメイン集約は以下の構造を持つ:

```
src/domain/{aggregate}/
├── schema/          # Zodバリデーションスキーマ
├── infrastructure/  # リポジトリ実装（インフラ層への依存）
├── repository.ts    # リポジトリインターフェース
├── useCase.ts       # ドメインビジネスロジック
└── index.ts         # 集約エクスポート、factory関数
```

### リポジトリパターン

**インターフェース**: `src/domain/{aggregate}/repository.ts`
**実装**: `src/domain/{aggregate}/infrastructure/`

リポジトリはドメイン層でインターフェースを定義し、インフラ層で実装する。

### ユースケース

**場所**: `src/domain/{aggregate}/useCase.ts`

- ビジネスロジックを含む
- リポジトリを依存性注入で受け取る
- `Result<T, E>`型を返す

---

## バリデーションパターン

### ドメイン層

**場所**: `src/domain/{aggregate}/schema/`

Zodスキーマでドメインモデルのバリデーションを定義。

### API層

**必須**: `@hono/zod-validator`を使用

全てのAPIエンドポイントで以下の順序でバリデーション:
1. `authenticator`（認証）
2. `zodValidator('param')`（パスパラメータ）
3. `zodValidator('json')`（リクエストボディ）
4. ハンドラー関数

```typescript
app.post(
  '/articles',
  authenticator,
  zodValidator('json', createArticleSchema),
  async (c) => {
    // 型安全なリクエストデータアクセス
    const body = c.req.valid('json')
    // ...
  }
)
```

---

## 依存性注入パターン

### Factory関数

**場所**: `src/domain/{aggregate}/index.ts`

各集約でfactory関数を提供し、依存性を注入:

```typescript
export function createArticleUseCase(db: PrismaClient) {
  const repository = new ArticleRepository(db)
  return new ArticleUseCase(repository)
}
```

---

## データベースアクセスパターン

### Prismaクライアント

**接続**: `src/infrastructure/rdb.ts`

- Cloudflare Workers対応
- Prisma Accelerateを使用
- 接続プーリング管理

### マイグレーション

**場所**: `src/infrastructure/prisma-orm/migrations/`

- スキーマファイルは`models/`で分割管理
- 全モデルは統一されたID/タイムスタンプパターンを使用

---

## ログパターン

**ロガー**: Pino（構造化ログ）

**場所**: `src/common/logger.ts`

重要な処理で適切にログを記録:
- エラー時
- 重要な状態変更時
- 外部サービス連携時

---

## 禁止パターン

### utilsディレクトリの作成禁止

詳細は[開発ルール](../../docs/development_rule.md)を参照

---

## ハイブリッドデプロイパターン

### Cloudflare Workers

**対象**: メインアプリケーション（API + Web）
**エントリーポイント**: `src/worker.ts`
**特徴**: エッジでの高速レスポンス

### Supabase Functions

**対象**: バックグラウンドジョブ
**場所**: `supabase/functions/*/index.ts`
**特徴**: 長時間処理、定期実行ジョブ

---

## テスト駆動開発（TDD）パターン

### 推奨フロー

1. ドメイン層でテストを先に書く（Red）
2. ユースケースを実装（Green）
3. リファクタリング（Refactor）
4. API層の統合テストを書く
5. 必要に応じてE2Eテストを追加

### テスト層の選択

- **ドメイン層変更**: `test:domain`（高速）
- **API層変更**: `test:api`（統合）
- **UI変更**: `test:frontend`, `test-storybook`
- **クリティカルパス**: `e2e`

---

## セキュリティパターン

### 認証・認可

**認証**: Supabase Auth
**セッション管理**: `@supabase/ssr`

### バリデーション

全てのAPIエンドポイントで入力バリデーション必須。

### サニタイゼーション

**場所**: `src/common/sanitization/`

ユーザー入力を適切にサニタイズ。
