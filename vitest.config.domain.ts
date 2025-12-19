/// <reference types="vitest" />
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

function generateIncludes(...paths: string[]) {
  const testInclude = paths.map((path) => `${path}/**/*.test.ts`)
  const coverageInclude = paths.map((path) => `${path}/**/*`)
  return { testInclude, coverageInclude }
}

const { testInclude, coverageInclude } = generateIncludes('src/domain', 'src/common')

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    name: 'domain',
    globals: true,
    include: testInclude,
    coverage: {
      enabled: true,
      provider: 'v8',
      reportsDirectory: './coverage/domain',
      reporter: ['text', 'json-summary', 'json'],
      thresholds: {
        statements: 60,
        branches: 80,
        functions: 60,
        lines: 60,
      },
      include: coverageInclude,
      exclude: ['src/domain/**/index.ts'],
    },
  },
})
