# コードスタイル・規約

## 基本方針
- **日本語で回答**（敬語は使用しない）
- **コメント追加禁止**（明示的に要求されない限り）
- **ファイル新規作成は最小限**（既存ファイル編集を優先）

## コードスタイル（Biome設定）
```json
{
  "indentStyle": "space",
  "indentWidth": 2,
  "lineWidth": 100,
  "quoteStyle": "single",
  "semicolons": "asNeeded",
  "trailingCommas": "all"
}
```

## 命名規約
- **関数**: camelCase, PascalCase
- **変数**: camelCase, PascalCase, CONSTANT_CASE
- **型**: PascalCase
- **プロパティ**: PascalCase, camelCase, CONSTANT_CASE

## インポート規約
- **絶対インポート**: `@/*` パスマッピング使用
- **相対インポート**: 同じディレクトリ内のみ

## エラーハンドリング
- **Result<T, E>型**: 関数型エラーハンドリング
- **サービス層**: Result型必須
- **API層**: HTTPExceptionに変換

## バリデーション
- **全APIエンドポイント**: zodValidator必須
- **順序**: authenticator → zodValidator(param) → zodValidator(json) → handler

## テストファイル命名
- `*.test.ts` - ユニット・統合テスト
- `*.stories.tsx` - Storybookテスト

## コミットメッセージ（Conventional Commits）
- `feat:` - 新機能
- `fix:` - バグ修正  
- `refactor:` - リファクタリング
- `test:` - テスト
- `docs:` - ドキュメント
- `style:` - スタイル修正
- `perf:` - パフォーマンス改善
- `chore:` - ビルド・ツール変更