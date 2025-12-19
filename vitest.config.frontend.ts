/// <reference types="vitest" />
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const testInclude = ['src/application/web/**/*.test.ts']
const coverageInclude = ['src/application/web/**/*.ts', 'src/application/web/components/**/*.ts']
const exclude = ['src/application/web/components/shadcn/**/*', 'src/application/web/**/*.tsx']

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    name: 'frontend',
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: testInclude,
    exclude,
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage/frontend',
      reporter: ['text', 'json-summary', 'json'],
      include: coverageInclude,
      exclude,
      thresholds: {
        branches: 80,
        functions: 60,
      },
    },
  },
})
