/// <reference types="vitest" />
// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'vite';
import { coverageReporter, srcAlias } from './config';

export default defineConfig({
  resolve: {
    alias: [srcAlias],
  },
  test: {
    globals: true,
    include: ['src/application/web/**/*.test.ts'],
    exclude: [
      'src/application/api/**/*',
      'src/application/middleware/**/*',
      'src/domain/**/*',
      'src/common/**/*',
      'src/logger/**/*',
    ],
    // テストファイルがない場合にエラーになるため、テストファイルがない場合でも正常終了とする
    passWithNoTests: true,
    coverage: {
      reporter: coverageReporter,
      include: ['src/application/web/**/*', 'src/application/web/components/**/*'],
      exclude: [
        'src/domain/**/*',
        'src/common/**/*',
        'src/logger/**/*',
        'src/application/middleware/**/*',
        'src/application/web/components/ui/**/*',
        'src/application/web/lib/utils.ts',
      ],
    },
  },
});
