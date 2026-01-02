/// <reference types="vitest" />
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { coverageReporter, generateIncludes } from '../generate'

// ci環境ではDATABASE_URLが設定されているため
// ローカルではSupabaseが54322ポートで起動する
const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'

const { testInclude, coverageInclude } = generateIncludes('src/application/api')

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    env: {
      DATABASE_URL: dbUrl,
    },
    // テスト間の影響が無いようにする
    // 参考: https://zenn.dev/microcms/articles/c3b9d48b5647b4#%E8%A8%AD%E5%AE%9A%E6%96%B9%E6%B3%95
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true, // シングルスレッドで実行
      },
    },
    include: testInclude,
    coverage: {
      reporter: coverageReporter,
      // ベタガキしないと、Github Actionsに閾値が反映されない
      thresholds: {
        statements: 60, // 命令網羅, ソースコードの全ての命令が実行されるかどうか
        branches: 80, // 分岐網羅, 処理のパスの通過率とほぼ同義
        functions: 60, // 関数網羅, 関数の実行パスの通過率
        lines: 60, // 行網羅, ソースコードの全ての行が実行されるかどうか
      },
      include: coverageInclude,
      exclude: ['src/application/api/handler/factory.ts'],
    },
  },
})
