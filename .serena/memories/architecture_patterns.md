# Architecture Patterns

## エラーハンドリングパターン

### 関数型エラーハンドリング
プロジェクトでは`Result<T, E>`型を使用した関数型エラーハンドリングパターンを採用している。

#### 基本型定義
```typescript
// src/common/types/utility.ts
export type Result<T extends any, E extends Error> = { data: T } | { error: E }
export type AsyncResult<T, E extends Error> = Promise<Result<T, E>>
```

#### ヘルパー関数
```typescript
// 成功結果作成
resultSuccess<T>(value: T): Result<T, never>

// エラー結果作成  
resultError<T, E extends Error>(error: E): Result<never, E>

// 成功判定
isSuccess<T, E>(result: Result<T, E>): result is { data: T }

// エラー判定
isError<T, E>(result: Result<T, E>): result is { error: E }
```

#### 使用例
```typescript
// ドメイン層での使用
async function findUser(id: string): AsyncResult<User, NotFoundError> {
  const user = await userRepository.findById(id)
  if (!user) {
    return resultError(new NotFoundError('User not found'))
  }
  return resultSuccess(user)
}

// 呼び出し側
const result = await findUser('123')
if (isSuccess(result)) {
  console.log(result.data.name)  // 型安全にアクセス
} else {
  console.error(result.error.message)
}
```

## カスタムエラー型

### エラー階層
```typescript
// src/common/errors/
├── ClientError      # 400系エラー（クライアント起因）
├── ServerError      # 500系エラー（サーバー起因）
├── NotFoundError    # リソースが見つからない
└── AlreadyExistsError  # リソースが既に存在
```

### API層でのエラー変換
```typescript
// src/common/errors/handle.ts
export function handleError(error: Error): HTTPException {
  if (error instanceof ClientError) {
    return new HTTPException(400, { message: error.message })
  }
  if (error instanceof NotFoundError) {
    return new HTTPException(404, { message: error.message })
  }
  // ... その他のエラー型
  return new HTTPException(500, { message: 'Internal Server Error' })
}
```

## バリデーションパターン

### API層バリデーション（必須）
全てのAPIエンドポイントで`zodValidator`の使用が必須

```typescript
import { zodValidator } from '@/application/middleware/zodValidator'

// 必須パターン
app.post('/users/:id',
  authenticator,                           // 1. 認証
  zodValidator('param', paramSchema),      // 2. パスパラメータ
  zodValidator('json', bodySchema),        // 3. リクエストボディ  
  async (c: ZodValidatedContext) => {      // 4. ハンドラー
    const { id } = c.req.valid('param')    // 型安全アクセス
    const body = c.req.valid('json')
    // ...
  }
)
```

### ドメイン層バリデーション
```typescript
// src/domain/{aggregate}/schema/
import { z } from 'zod'

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(50),
})

export type User = z.infer<typeof userSchema>
```

## ドメイン駆動設計パターン

### 集約構造
```
src/domain/{aggregate}/
├── model/           # エンティティ・値オブジェクト
├── schema/          # Zodバリデーションスキーマ  
├── infrastructure/  # リポジトリ実装
├── repository.ts    # リポジトリインターフェース
├── useCase.ts       # アプリケーションサービス
└── index.ts         # ファクトリー・エクスポート
```

### リポジトリパターン
```typescript
// repository.ts (インターフェース)
export interface UserRepository {
  findById(id: string): AsyncResult<User, NotFoundError>
  save(user: User): AsyncResult<User, ServerError>
}

// infrastructure/userImpl.ts (実装)
export class UserRepositoryImpl implements UserRepository {
  async findById(id: string): AsyncResult<User, NotFoundError> {
    // Prisma実装
  }
}
```

### ユースケースパターン
```typescript
// useCase.ts
export class UserUseCase {
  constructor(private userRepository: UserRepository) {}

  async getUser(id: string): AsyncResult<User, NotFoundError> {
    return this.userRepository.findById(id)
  }

  async createUser(data: CreateUserData): AsyncResult<User, AlreadyExistsError> {
    // ビジネスロジック
  }
}
```

## テストパターン

### ドメインテスト（ユニット）
```typescript
// モックを使用したユニットテスト
import { mockDeep } from 'vitest-mock-extended'
import { prisma } from '@/test/__mocks__/prisma'

describe('UserUseCase', () => {
  const mockRepository = mockDeep<UserRepository>()
  const useCase = new UserUseCase(mockRepository)

  it('should return user when found', async () => {
    // テスト実装
  })
})
```

### API統合テスト
```typescript
// 実データベースを使用した統合テスト
describe('POST /api/users', () => {
  beforeEach(async () => {
    await resetDatabase()
  })

  it('should create user successfully', async () => {
    // 実DB使用テスト
  })
})
```

## 設計原則

### 禁止事項
- **utilsの作成禁止**: utilsディレクトリやファイルの作成は禁止
- **直接的DB操作**: ドメイン層でのPrismaクライアント直接使用禁止

### 推奨パターン
- **関数型エラーハンドリング**: 例外ではなくResult型を使用
- **型安全性**: TypeScriptの型システムを最大活用
- **テスト駆動開発**: テストケース名を先に記載
- **単一責任の原則**: 各クラス・関数は単一の責任を持つ

### 依存関係のルール
```
API層 → ドメイン層 → インフラ層
  ↓
Web層（フロントエンド）
```

- 上位層は下位層に依存可能
- 下位層は上位層に依存してはならない
- ドメイン層はインフラ層の詳細を知らない（DIP：依存関係逆転の原則）