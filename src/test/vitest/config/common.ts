/// <reference types="vitest" />
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { coverageReporter, generateIncludes } from '../generate'

const { testInclude, coverageInclude } = generateIncludes('src/common')

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    include: testInclude,
    coverage: {
      reporter: coverageReporter,
      // ベタガキしないと、GitHub Actionsに閾値が反映されない
      thresholds: {
        statements: 80, // 命令網羅, ソースコードの全ての命令が実行されるかどうか
        branches: 80, // 分岐網羅, 処理のパスの通過率とほぼ同義
        functions: 80, // 関数網羅, 関数の実行パスの通過率
        lines: 80, // 行網羅, ソースコードの全ての行が実行されるかどうか
      },
      include: coverageInclude,
      // 集約export用のindexを除外
      exclude: ['src/common/**/index.ts'],
    },
  },
})
