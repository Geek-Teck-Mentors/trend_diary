/// <reference types="vitest" />
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { coverageReporter } from '../generate'

const testInclude = ['src/application/client/**/*.test.ts']

const coverageInclude = [
  'src/application/client/**/*.ts',
  'src/application/client/components/**/*.ts',
]
const exclude = ['src/application/client/components/shadcn/**/*', 'src/application/client/**/*.tsx']

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/vitest/frontend/setup.ts'],
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
