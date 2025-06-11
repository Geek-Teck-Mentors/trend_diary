/// <reference types="vitest" />
// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'vite';
import { coverageReporter, generateIncludes } from './config';
import tsconfigPaths from 'vite-tsconfig-paths';

// ci環境ではDATABASE_URLが設定されているため
const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/test';

const { testInclude, coverageInclude } = generateIncludes('src/application/api');

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
        branches: 60, // 分岐網羅, 処理のパスの通過率とほぼ同義
        functions: 60, // 関数網羅, 関数の実行パスの通過率
        lines: 60, // 行網羅, ソースコードの全ての行が実行されるかどうか
      },
      include: coverageInclude,
    },
  },
});
