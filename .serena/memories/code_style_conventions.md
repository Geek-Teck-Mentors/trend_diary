# コードスタイルと規約

## 言語とフォーマット
- **言語**: TypeScript
- **エンコーディング**: UTF-8
- **フォーマッター**: Biome
- **リンター**: Biome

## コミットメッセージ規約
Conventional Commitsを使用:
- `feat:` - 新機能追加
- `fix:` - バグ修正
- `refactor:` - リファクタリング（機能変更なし）
- `test:` - テスト追加・修正
- `docs:` - ドキュメント更新
- `style:` - コードスタイル修正（フォーマット等）
- `perf:` - パフォーマンス改善
- `chore:` - ビルドプロセス・補助ツール等の変更

## インポート規約
- **絶対インポート推奨**: `src/`ルートからの絶対インポートを使用
- **TypeScript path mapping**: `@/*` エイリアスを使用

## ファイル・ディレクトリ構造
### ドメイン層の構造
```
src/domain/{aggregate}/
├── schema/          # Zodバリデーションスキーマ
├── infrastructure/  # リポジトリ実装
├── repository.ts    # リポジトリインターフェース
├── use-case.ts      # ドメインビジネスロジック
├── factory.ts       # ファクトリー関数
└── index.ts         # 集約エクスポート
```

### Prismaスキーマ
- スキーマファイルは`src/infrastructure/prisma-orm/models/`内で分割管理
- 全モデルは統一されたID/タイムスタンプパターンでベーススキーマを拡張

## 命名規約
- **ファイル名**: kebab-case（推奨）
- **コンポーネント**: PascalCase
- **関数・変数**: camelCase
- **型・インターフェース**: PascalCase
- **定数**: UPPER_SNAKE_CASE

## エラーハンドリング規約
### 関数型エラーハンドリング
- サービス層は`Result<T, E>`型を返す（`src/common/types/utility.ts`で定義）
- 非同期処理では`AsyncResult<T, E>`型を使用
- エラーハンドリングヘルパー関数:
  - `resultSuccess<T>(value: T)`: 成功結果を作成
  - `resultError<T, E>(error: E)`: エラー結果を作成
  - `isSuccess<T, E>(result)`: 成功かどうかを判定
  - `isError<T, E>(result)`: エラーかどうかを判定

### カスタムエラー型
- `src/common/errors/`に定義:
  - `ClientError`: クライアントエラー（400系）
  - `ServerError`: サーバーエラー（500系）
  - `NotFoundError`: リソースが見つからない
  - `AlreadyExistsError`: リソースが既に存在

### API層のエラーハンドリング
- `handleError`関数でHTTPExceptionに変換

## バリデーション規約
### API層のバリデーション
- **必須ルール**: 全APIエンドポイントで`zodValidator`の使用が必須
- **バリデーション対象**:
  - `query`: クエリパラメータ
  - `param`: パスパラメータ
  - `json`: リクエストボディ
- **バリデーション順序**: authenticator → zodValidator(param) → zodValidator(json) → handler
- **型安全性**: `ZodValidatedContext`系の型を使用

### ドメイン層のバリデーション
- Zodスキーマをドメイン層に定義
- データ検証にZodスキーマを使用

## 禁止事項
- **utilsの作成禁止**: 汎用的なutilsディレクトリ・ファイルの作成を禁止

## コメント・ドキュメント
- コードは自己説明的であることを優先
- 必要な場合のみコメントを追加
- 複雑なロジックには説明コメントを追加

## ログ規約
- Pinoロガーで構造化ログを使用
- 重要な処理のログを適切に記録
