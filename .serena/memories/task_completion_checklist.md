# タスク完了チェックリスト

## 基本フロー（CLAUDE.mdより）
**リファクタリング時は必ずlint, format, testコマンドを実行すること**

## 1. 開発・実装時

### コード品質チェック
```bash
# 推奨：統合チェック（Biome CI + 型チェック）
npm run lint:ci

# または個別実行
npm run lint          # Lintチェック
npm run tsc           # TypeScript型チェック
npm run format        # フォーマットチェック
```

### 自動修正
```bash
npm run check:fix     # 総合チェック・修正
npm run lint:fix      # Lint自動修正
npm run format:fix    # フォーマット修正
```

## 2. テスト実行

### 層別テスト
```bash
npm run test:service    # ドメイン/サービス層
npm run test:api        # API層
npm run test:frontend   # フロントエンド
npm run test-storybook  # Storybook
npm run e2e             # E2Eテスト
```

### 個別ファイルテスト
```bash
npm run test:service -- path/to/file
npm run test:api -- path/to/file
npm run test:frontend -- path/to/file
```

## 3. データベース関連

### マイグレーション後
```bash
npm run db:gen        # Prisma型生成
npm run tsc           # 型チェック
```

## 4. コミット前

### 必須チェック
1. `npm run lint:ci` - CI用チェック実行
2. 該当層のテスト実行
3. 機能テスト実行

### コミットメッセージ（Conventional Commits）
```bash
git commit -m "feat: 機能説明 TDD cycle complete"
git commit -m "fix: バグ修正内容 TDD cycle complete"
git commit -m "refactor: リファクタリング内容 TDD cycle complete"
```

## 5. PR作成前

### 最終チェック
1. 全テスト実行
2. ビルド確認: `npm run build`
3. E2Eテスト: `npm run e2e`

### エラー時対応
- ビルドエラー → 型エラー修正
- テストエラー → テスト修正またはコード修正
- Lintエラー → `npm run check:fix`で自動修正