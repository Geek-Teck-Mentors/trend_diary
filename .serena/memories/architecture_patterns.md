# アーキテクチャパターン

## ドメイン駆動設計（DDD）構造
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

## エラーハンドリングパターン
**関数型エラーハンドリング**を使用：

- サービス層: `Result<T, E>`型を返す
- 非同期処理: `AsyncResult<T, E>`型
- ヘルパー関数:
  - `resultSuccess<T>(value: T)`: 成功結果作成
  - `resultError<T, E>(error: E)`: エラー結果作成
  - `isSuccess<T, E>(result)`: 成功判定
  - `isError<T, E>(result)`: エラー判定

## カスタムエラー型（`src/common/errors/`）
- `ClientError`: クライアントエラー（400系）
- `ServerError`: サーバーエラー（500系）
- `NotFoundError`: リソースが見つからない
- `AlreadyExistsError`: リソースが既に存在

## API層バリデーション規約
**全てのAPIエンドポイントで`zodValidator`の使用が必須**

- `query`: クエリパラメータ
- `param`: パスパラメータ  
- `json`: リクエストボディ
- **バリデーション順序**: authenticator → zodValidator(param) → zodValidator(json) → handler
- **型安全性**: `ZodValidatedContext`系の型使用

## テスト戦略（多層構造）
- **サービス層**: `vitest/config.service.ts` - モックPrismaクライアント
- **API層**: `vitest/config.api.ts` - 実際のデータベース
- **フロントエンド**: `vitest/config.frontend.ts` - コンポーネント・フック
- **Storybook**: `vitest/config.storybook.ts` - UIコンポーネント
- **E2E**: Playwright - エンドツーエンドシナリオ