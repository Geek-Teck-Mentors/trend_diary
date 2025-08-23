# Task Completion Checklist

## タスク完了時に必ず実行すること

### 1. コード品質チェック（必須）
```bash
# 基本的にこのコマンドのみ実行（推奨）
npm run lint  # Biome CI + TypeScript型チェック
```

個別実行が必要な場合：
```bash
npm run tsc        # TypeScript型チェックのみ
npm run check      # Biome総合チェック
npm run check:fix  # Biome自動修正付きチェック
```

### 2. テスト実行（機能によって選択）

#### ドメイン層の変更
```bash
npm run test:domain
```

#### API層の変更
```bash
npm run test:api
```

#### フロントエンド変更
```bash
npm run test:frontend
```

#### UIコンポーネント変更
```bash
npm run test-storybook
```

#### 重要な機能変更・新機能追加
```bash
npm run e2e
```

### 3. 重要な変更時の追加チェック

#### データベース変更
```bash
# マイグレーション確認
npm run db:migrate

# シード確認
npm run db:seed
```

#### 本番ビルド確認（重要な変更時）
```bash
npm run build
```

## Git コミット前チェックリスト

### 1. 動作確認
- [ ] 開発サーバーが正常に起動する (`npm start`)
- [ ] 変更箇所が期待通りに動作する
- [ ] 既存機能が壊れていない

### 2. コード品質
- [ ] `npm run lint` が通る
- [ ] 関連するテストが通る
- [ ] 新しいコードにテストを追加している

### 3. コミットメッセージ
- [ ] Conventional Commitsに従っている
- [ ] 適切なプレフィックスを使用している
  - `feat:` 新機能追加
  - `fix:` バグ修正
  - `refactor:` リファクタリング
  - `test:` テスト追加・修正
  - `docs:` ドキュメント更新

## リファクタリング時の特別ルール

リファクタリング時は以下のコマンドを**必ず**実行すること：

```bash
npm run lint           # 必須
npm run test:domain    # ドメイン変更時
npm run test:api       # API変更時
npm run test:frontend  # UI変更時
```

## プルリクエスト前チェックリスト

### 1. 全テスト実行
```bash
npm run test:domain
npm run test:api
npm run test:frontend
npm run e2e  # 重要な変更の場合
```

### 2. 品質チェック
```bash
npm run lint
npm run build
```

### 3. 動作確認
- [ ] 開発環境で正常動作
- [ ] 関連する画面・機能のテスト
- [ ] エラーハンドリングの確認

### 4. ドキュメント更新
- [ ] 必要に応じてCLAUDE.mdの更新
- [ ] 新しいAPIの場合、ドキュメントの追加
- [ ] 破壊的変更の場合、移行ガイドの作成

## エラーが発生した場合

### Lintエラー
```bash
npm run check:fix  # 自動修正
```

### TypeScriptエラー
- 型定義の確認
- importパスの確認
- 設定ファイル（tsconfig.json）の確認

### テストエラー
- テストケースの見直し
- モックの設定確認
- テストデータの準備確認

### ビルドエラー
- 依存関係の確認
- 環境変数の確認
- 設定ファイルの確認