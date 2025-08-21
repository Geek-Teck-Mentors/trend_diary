/// <reference types="vitest" />
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { coverageReporter } from './config'

const testInclude = ['src/application/web/**/*.test.ts']

const coverageInclude = ['src/application/web/**/*.ts', 'src/application/web/components/**/*.ts']
const exclude = ['src/application/web/components/ui/**/*', 'src/application/web/**/*.tsx']

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: testInclude,
    exclude,
    // テストファイルがない場合にエラーになるため、テストファイルがない場合でも正常終了とする
    passWithNoTests: true,
    coverage: {
      reporter: coverageReporter,
      include: coverageInclude,
      exclude,
      thresholds: {
        branches: 80, // 分岐網羅
        functions: 60, // 関数網羅
      },
    },
  },
})
