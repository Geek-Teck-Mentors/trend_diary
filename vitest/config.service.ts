/// <reference types="vitest" />
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { coverageReporter, generateIncludes } from './config'

const { testInclude, coverageInclude } = generateIncludes('src/domain', 'src/common')

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    include: testInclude,
    coverage: {
      reporter: coverageReporter,
      // ベタガキしないと、Github Actionsに閾値が反映されない
      thresholds: {
        statements: 60, // 命令網羅, ソースコードの全ての命令が実行されるかどうか
        branches: 60, // 分岐網羅, 処理のパスの通過率とほぼ同義
        functions: 60, // 関数網羅, 関数の実行パスの通過率
        lines: 60, // 行網羅, ソースコードの全ての行が実行されるかどうか
      },
      include: coverageInclude,
      // 集約export用のindexを除外
      exclude: ['src/domain/**/index.ts']
    },
  },
})
