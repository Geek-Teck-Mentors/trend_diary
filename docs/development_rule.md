## 開発ルール

### 基本方針

- 仕様はテストコードに記載する（コードを書かずともテストケース名は記載する）
- リファクタリング時は必ずlint、format、testコマンドを実行する

### コミットメッセージ（Conventional Commits）

コミットタイプを明確にすることで、変更の種類を一目で把握できるようにする。

- `feat:` - 新機能追加
- `fix:` - バグ修正
- `refactor:` - リファクタリング（機能変更なし）
- `test:` - テスト追加・修正
- `docs:` - ドキュメント更新
- `style:` - コードスタイル修正（フォーマット等）
- `perf:` - パフォーマンス改善
- `chore:` - ビルドプロセス・補助ツール等の変更

**使用例:**

```bash
# 新機能の場合
git commit -m "feat: add user authentication TDD cycle complete"

# バグ修正の場合
git commit -m "fix: resolve login validation issue TDD cycle complete"

# リファクタリングの場合
git commit -m "refactor: improve article domain structure TDD cycle complete"
```

### 重要な規約

**インポート**: `src/`ルートからの絶対インポートを使用（TypeScript path mapping: `@/*`）

**バリデーション**:
- データ検証にドメイン層のZodスキーマを使用
- 全てのAPI層エンドポイントで`zodValidator`の使用が必須
  - `query`: クエリパラメータのバリデーション
  - `param`: パスパラメータのバリデーション
  - `json`: リクエストボディのバリデーション
- バリデーション失敗時は自動的に422ステータスで返却
- `ZodValidatedContext`系の型を使用してハンドラー関数で型安全にデータアクセス
- **バリデーション順序**: authenticator → zodValidator(param) → zodValidator(json) → handler

**その他**:
- utilsの作成は禁止
  - 理由: 責任の所在が不明確になり、アーキテクチャ層の境界が曖昧になる。DDDの原則を遵守し、貧血性ドメインを防ぐため
  - 代替案:
    - 共通ロジックは`src/common/`配下の明確な目的を持ったディレクトリに配置
    - ドメイン固有のロジックは各集約内に配置
- Pinoロガーで構造化ログを使用

### 開発コマンド

主要なコマンドは以下の通り。詳細は`package.json`を参照。

**ビルドとデプロイ:**
- `npm start` - React Routerで開発サーバーを起動
- `npm run build` - 本番用ビルド

**テスト:**
- `npm run test:domain` - ドメイン層のテストを実行
- `npm run test:api` - API層のテストを実行
- `npm run test:frontend` - フロントエンドコンポーネントのテストを実行
- `npm run test-storybook` - Storybookのテストを実行
- `npm run e2e` - PlaywrightでE2Eテストを実行

**データベース:**
- `npm run db:migrate` - Prismaマイグレーション実行（開発用）
- `npm run db:migrate:sql-only` - SQLのみのマイグレーション実行
- `npm run db:reset` - データベースリセット
- `npm run db:seed` - データベースシード実行
- `npm run supabase:db:type-gen` - Supabase型生成

**コード品質:**
- `npm run lint` - Biome CI実行 + TypeScript型チェック（基本的にこれを使用する）
