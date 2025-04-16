/// <reference types="vitest" />
// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'vite';
import { coverageReporter, srcAlias } from './config';

const testInclude = ['src/application/web/**/*.test.ts'];
const testExclude = [
  'src/application/api/**/*',
  'src/application/middleware/**/*',
  'src/domain/**/*',
  'src/common/**/*',
  'src/logger/**/*',
];

const coverageInclude = ['src/application/web/**/*', 'src/application/web/components/**/*'];
const coverageExclude = [
  ...testExclude,
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
    exclude: testExclude,
    // テストファイルがない場合にエラーになるため、テストファイルがない場合でも正常終了とする
    passWithNoTests: true,
    coverage: {
      reporter: coverageReporter,
      include: coverageInclude,
      exclude: coverageExclude,
    },
  },
});
