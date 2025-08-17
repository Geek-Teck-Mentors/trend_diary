# アーキテクチャパターン

## 全体アーキテクチャ
**ドメイン駆動設計（DDD）** + **クリーンアーキテクチャ** + **Cloudflare Workers + Supabase Functions** ハイブリッド構成

## 層構造

### 1. ドメイン層（src/domain/）
```
domain/{aggregate}/
├── factory/         # ドメインサービスファクトリ
├── model/           # ドメインエンティティ
├── service/         # ドメインビジネスロジック
├── repository/      # リポジトリインターフェース
├── schema/          # Zodバリデーションスキーマ
├── infrastructure/  # リポジトリ実装
└── index.ts         # 集約エクスポート
```

### 2. アプリケーション層（src/application/）
- **API層**: Hono + React Routerアダプター
- **Web層**: React Router v7 フロントエンド
- **ミドルウェア**: 認証・バリデーション・エラーハンドリング

### 3. インフラストラクチャ層（src/infrastructure/）
- **データベース**: Prisma ORM
- **外部API**: 通知サービス等

## 主要パターン

### エラーハンドリング（関数型）
```typescript
// Result<T, E>型でエラーハンドリング
type Result<T, E> = { success: true; data: T } | { success: false; error: E }

// サービス層：Result型を返す
return resultSuccess(user)
return resultError(new NotFoundError('User not found'))

// API層：HTTPExceptionに変換
if (isError(result)) {
  throw new HTTPException(404, { message: result.error.message })
}
```

### バリデーション戦略
```typescript
// 全APIエンドポイントでzodValidator必須
app.post('/api/users',
  authenticator,
  zodValidator('param', paramSchema),
  zodValidator('json', bodySchema),
  handler
)
```

### ドメインモデル
- **集約ルート**: User, Article, Policy
- **値オブジェクト**: 各スキーマで定義
- **ドメインサービス**: 複雑なビジネスロジック

## デプロイメント
- **メインアプリ**: Cloudflare Workers（/functions/[[path]].ts）
- **バックグラウンド**: Supabase Functions
- **データベース**: PostgreSQL + Prisma

## 重要な制約
- **utilsの作成禁止**
- **絶対インポート**: @/* パスマッピング使用
- **API層バリデーション**: zodValidator必須
- **関数型エラーハンドリング**: Result<T,E>型必須