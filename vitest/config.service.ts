/// <reference types="vitest" />
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { coverageReporter, generateIncludes } from './config'

const { testInclude, coverageInclude } = generateIncludes('src/domain', 'src/common')

// リポジトリの詳細実装での単体テストには担保できる品質特性がないため、除外
const testExclude = ['src/domain/**/infrastructure/*']

// カバレッジ対象のファイルパスを生成（.test.tsファイル以外全部）
const coverageExclude = [...testExclude]

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    include: testInclude,
    exclude: testExclude,
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
      exclude: coverageExclude,
    },
  },
})
