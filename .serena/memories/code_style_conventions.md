# Code Style Conventions

## TypeScript設定

### 基本設定
- **Target**: ESNext
- **Module**: ESNext, Bundler resolution
- **Strict mode**: 有効
- **noImplicitAny**: 有効
- **JSX**: react-jsx

### パスマッピング
```typescript
// src/からの絶対インポートを使用
import { UserRepository } from '@/domain/user/repository'
```

## Biome設定（Linter + Formatter）

### フォーマット設定
- **インデント**: スペース2個
- **行幅**: 100文字
- **行末**: LF
- **セミコロン**: 必要な場合のみ（asNeeded）
- **クォート**: シングルクォート
- **JSXクォート**: シングルクォート
- **トレイリングカンマ**: 常に付ける
- **アロー関数**: 常に括弧を付ける

### 命名規則
- **関数**: camelCase, PascalCase
- **変数**: camelCase, PascalCase, CONSTANT_CASE
- **型・インターフェース**: PascalCase
- **オブジェクトプロパティ**: camelCase, snake_case, PascalCase, CONSTANT_CASE

### 主要なLintルール
- **アクセシビリティ**: 厳格なa11yルール適用
- **等価比較**: `===` / `!==` を強制（`==` / `!=` 禁止）
- **未使用変数/インポート**: エラー
- **console.log**: 警告
- **alert/debugger**: 警告/エラー
- **var**: 禁止（let/const使用）
- **arrow function**: 推奨

## アーキテクチャ規約

### エラーハンドリング
```typescript
// Result型を使用した関数型エラーハンドリング
export type Result<T, E extends Error> = { data: T } | { error: E }

// 使用例
const result: Result<User, NotFoundError> = await findUser(id)
if (isSuccess(result)) {
  // result.data でアクセス
} else {
  // result.error でエラーハンドリング
}
```

### インポート規約
- **絶対パス**: `@/*` を使用してsrcルートからインポート
- **相対パス**: 同一ディレクトリ内のファイルのみ
- **インポート整理**: Biomeの自動整理機能を使用

### API層バリデーション規約
```typescript
// 全APIエンドポイントでzodValidatorを必須使用
app.post('/users',
  authenticator,                    // 認証
  zodValidator('param', paramSchema), // パスパラメータ
  zodValidator('json', bodySchema),   // リクエストボディ
  async (c) => {
    // ZodValidatedContext型で型安全にアクセス
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')
  }
)
```

### テストファイル配置
- テストファイルは実装ファイルと同じ階層に配置
- `test`フォルダは作成しない
- 例: `src/domain/user/useCase.ts` → `src/domain/user/useCase.test.ts`

## Git規約

### Conventional Commits
```bash
feat: 新機能追加
fix: バグ修正
refactor: リファクタリング（機能変更なし）
test: テスト追加・修正
docs: ドキュメント更新
style: コードスタイル修正（フォーマット等）
perf: パフォーマンス改善
chore: ビルドプロセス・補助ツール等の変更
```

## 開発ルール
- **仕様記載**: テストコードに仕様を記載する
- **TDD推奨**: コードを書く前にテストケース名を記載
- **utils禁止**: utilsディレクトリ・ファイルの作成を禁止