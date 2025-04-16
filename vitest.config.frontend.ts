/// <reference types="vitest" />
// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'vite';
import { coverageReporter, srcAlias } from './config';

// テスト対象とするファイルパスを定義
const testInclude = ['src/application/web/**/*.test.ts'];

// カバレッジから除外するファイルパスを定義
const coverageExclude = [
  'src/application/api/**/*',
  'src/application/middleware/**/*',
  'src/domain/**/*',
  'src/common/**/*',
  'src/logger/**/*',
  'src/application/web/components/ui/**/*',
  'src/application/web/lib/utils.ts',
];

export default defineConfig({
  resolve: {
    alias: [srcAlias],
  },
  test: {
    globals: true,
    include: testInclude,
    // テストファイルがない場合にエラーになるため、テストファイルがない場合でも正常終了とする
    passWithNoTests: true,
    coverage: {
      reporter: coverageReporter,
      include: ['src/application/web/**/*', 'src/application/web/components/**/*'],
      exclude: coverageExclude,
    },
  },
});
