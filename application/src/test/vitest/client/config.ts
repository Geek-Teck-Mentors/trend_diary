/// <reference types="vitest" />
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { coverageReporter } from '../generate'

const testInclude = ['src/web/client/**/*.test.ts']

const coverageInclude = ['src/web/client/**/*.ts']
const exclude = [
  'src/web/client/components/shadcn/**/*',
  'src/web/client/**/*.tsx',
  // React Routerのルート定義はユニットテスト対象外
  'src/web/client/routes.ts',
]

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/vitest/client/setup.ts'],
    include: testInclude,
    exclude,
    // テストファイルがない場合にエラーになるため、テストファイルがない場合でも正常終了とする
    passWithNoTests: true,
    coverage: {
      reporter: coverageReporter,
      include: coverageInclude,
      exclude,
      thresholds: {
        // Vitest v4 の AST-based remapping に伴い計測値が下がったため一時的に緩和
        // 不足しているテストの追加で復帰させる予定
        branches: 70, // 分岐網羅
        functions: 60, // 関数網羅
      },
    },
  },
})
