/// <reference types="vitest" />
// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'vite';
import { coverageReporter, srcAlias } from './config';

// ci環境ではDATABASE_URLが設定されているため
const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/test';

const testTargetPaths = ['src/application/api', 'src/domain', 'src/common'];

const testInclude = testTargetPaths.map((path) => `${path}/**/*.test.ts`);

const testExclude = ['src/domain/repository/*'];

// カバレッジ対象のファイルパスを生成（.test.tsファイル以外全部）
const coverageInclude = testTargetPaths.map((path) => `${path}/**/*`);

export default defineConfig({
  resolve: {
    alias: [srcAlias],
  },
  test: {
    globals: true,
    env: {
      DATABASE_URL: dbUrl,
    },
    include: testInclude,
    exclude: testExclude,
    coverage: {
      reporter: coverageReporter,
      thresholds: {
        statements: 60, // 命令網羅, ソースコードの全ての命令が実行されるかどうか
        branches: 60, // 分岐網羅, 処理のパスの通過率とほぼ同義
        functions: 60, // 関数網羅, 関数の実行パスの通過率
        lines: 60, // 行網羅, ソースコードの全ての行が実行されるかどうか
      },
      include: coverageInclude,
    },
  },
});
