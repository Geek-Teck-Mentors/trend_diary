/// <reference types="vitest" />
// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'vite';
import { coverageReporter, srcAlias } from './config';

// ci環境ではDATABASE_URLが設定されているため
const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/test';

const testInclude = ['src/**/*.test.ts'];
const testExclude = [
  'src/application/middleware/**/*',
  'src/logger/**/*',
  'src/application/web/**/*',
  'src/domain/repository/*',
];

const coverageInclude = ['src/**/*'];
const coverageExclude = [...testExclude];

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
      exclude: coverageExclude,
    },
  },
});
