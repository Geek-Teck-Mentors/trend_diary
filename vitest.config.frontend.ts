/// <reference types="vitest" />
// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'vite';
import { coverageReporter, srcAlias } from './config';

const testInclude = ['src/application/web/**/*.test.ts'];

const coverageInclude = ['src/application/web/**/*', 'src/application/web/components/**/*'];
const exclude = ['src/application/web/components/ui/**/*'];

export default defineConfig({
  resolve: {
    alias: [srcAlias],
  },
  test: {
    globals: true,
    include: testInclude,
    exclude,
    // テストファイルがない場合にエラーになるため、テストファイルがない場合でも正常終了とする
    passWithNoTests: true,
    coverage: {
      reporter: coverageReporter,
      include: coverageInclude,
      exclude,
    },
  },
});
