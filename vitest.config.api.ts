/// <reference types="vitest" />
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

function generateIncludes(...paths: string[]) {
  const testInclude = paths.map((path) => `${path}/**/*.test.ts`)
  const coverageInclude = paths.map((path) => `${path}/**/*`)
  return { testInclude, coverageInclude }
}

const { testInclude, coverageInclude } = generateIncludes('src/application/api')

// ci環境ではDATABASE_URLが設定されているため
// ローカルではSupabaseが54322ポートで起動する
const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    name: 'api',
    globals: true,
    env: {
      DATABASE_URL: dbUrl,
    },
    // テスト間の影響が無いようにする
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    include: testInclude,
    coverage: {
      enabled: true,
      provider: 'v8',
      reportsDirectory: './coverage/api',
      reporter: ['text', 'json-summary', 'json'],
      thresholds: {
        statements: 60,
        branches: 80,
        functions: 60,
        lines: 60,
      },
      include: coverageInclude,
    },
  },
})
