/// <reference types="vitest" />
// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'vite';

// ci環境ではDATABASE_URLが設定されているため
const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/test';

const includeDirs = ['src/application/api', 'src/domain', 'src/common'];
const includeFiles = includeDirs.map((dir) => `${dir}/**/*.test.ts`);
const includeCoverageDirs = includeDirs.map((dir) => `${dir}/**/*`);

// exclude対象はリポジトリのファイルのみを指定
const exclude = ['src/domain/repository/**/*'];

export default defineConfig({
  resolve: {
    alias: [
      {
        find: '@',
        replacement: '/src',
      },
    ],
  },
  test: {
    globals: true,
    env: {
      DATABASE_URL: dbUrl,
    },
    include: includeFiles,
    exclude,
    coverage: {
      reporter: ['text', 'json-summary', 'json'],
      thresholds: {
        statements: 60, // 命令網羅, ソースコードの全ての命令が実行されるかどうか
        branches: 60, // 分岐網羅, 処理のパスの通過率とほぼ同義
        functions: 60, // 関数網羅, 関数の実行パスの通過率
        lines: 60, // 行網羅, ソースコードの全ての行が実行されるかどうか
      },
      include: includeCoverageDirs,
      exclude,
    },
  },
});
