# タスク完了時のチェックリスト

## 必須実行コマンド
リファクタリング時は**必ず**以下のコマンドを実行する：

1. **`npm run lint:ci`** - Biome CI + TypeScript型チェック（基本的にこれを使用）
2. **`npm run lint`** - Biomeでlint実行
3. **`npm run format`** - Biomeでコードフォーマットチェック
4. **テストコマンド** - 変更した層に応じて適切なテストを実行

## テスト実行指針
変更した内容に応じて適切なテストを実行：

- **ドメイン/サービス層の変更**: `npm run test:service`
- **API層の変更**: `npm run test:api`
- **フロントエンド変更**: `npm run test:frontend`
- **UIコンポーネント変更**: `npm run test-storybook`
- **全体的な変更**: `npm run e2e`

## 品質確認
- すべてのlint・formatエラーが解消されていること
- TypeScript型エラーがないこと
- 関連するテストがパスしていること
- コミットメッセージがConventional Commits形式に従っていること

## 禁止事項
- utilsの作成は禁止
- コメントの追加（明示的に要求されない限り）