/// <reference types="vitest" />
// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'vite';

// ci環境ではDATABASE_URLが設定されているため
const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/test';

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
    include: ['src/**/*.test.ts'],
    exclude: [
      'src/app/**/*',
      'src/middleware/**/*',
      'src/logger/**/*',
      'src/lib/**/*',
      'src/components/**/*',
      'src/domain/**/repository/*.ts',
    ],
    coverage: {
      reporter: ['text', 'json-summary', 'json'],
      thresholds: {
        statements: 60, // 命令網羅, ソースコードの全ての命令が実行されるかどうか
        branches: 60, // 分岐網羅, 処理のパスの通過率とほぼ同義
        functions: 60, // 関数網羅, 関数の実行パスの通過率
        lines: 60, // 行網羅, ソースコードの全ての行が実行されるかどうか
      },
      include: ['src/**/*'],
      exclude: [
        'src/app/**/*',
        'src/middleware/**/*',
        'src/logger/**/*',
        'src/lib/**/*',
        'src/components/**/*',
        'src/domain/**/repository/*.ts',
      ],
    },
  },
});
