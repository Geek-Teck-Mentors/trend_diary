/// <reference types="vitest" />
import storybookTest from '@storybook/addon-vitest/vitest-plugin'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineWorkspace } from 'vitest/config'

// 共通のカバレッジレポーター設定
const coverageReporter = ['text', 'json-summary', 'json']

// パスからテストとカバレッジのインクルードパターンを生成
function generateIncludes(...paths: string[]) {
  const testInclude = paths.map((path) => `${path}/**/*.test.ts`)
  const coverageInclude = paths.map((path) => `${path}/**/*`)
  return { testInclude, coverageInclude }
}

export default defineWorkspace([
  // ドメイン層のテスト
  {
    extends: './vite.config.ts',
    plugins: [tsconfigPaths()],
    test: {
      name: 'domain',
      globals: true,
      include: generateIncludes('src/domain', 'src/common').testInclude,
      coverage: {
        reporter: coverageReporter,
        thresholds: {
          statements: 60,
          branches: 80,
          functions: 60,
          lines: 60,
        },
        include: generateIncludes('src/domain', 'src/common').coverageInclude,
        exclude: ['src/domain/**/index.ts'],
      },
    },
  },
  // API層のテスト
  {
    extends: './vite.config.ts',
    plugins: [tsconfigPaths()],
    test: {
      name: 'api',
      globals: true,
      env: {
        DATABASE_URL:
          process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
      },
      pool: 'threads',
      poolOptions: {
        threads: {
          singleThread: true,
        },
      },
      include: generateIncludes('src/application/api').testInclude,
      coverage: {
        reporter: coverageReporter,
        thresholds: {
          statements: 60,
          branches: 80,
          functions: 60,
          lines: 60,
        },
        include: generateIncludes('src/application/api').coverageInclude,
      },
    },
  },
  // フロントエンドのテスト
  {
    extends: './vite.config.ts',
    plugins: [tsconfigPaths()],
    test: {
      name: 'frontend',
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/application/web/**/*.test.ts'],
      exclude: ['src/application/web/components/shadcn/**/*', 'src/application/web/**/*.tsx'],
      passWithNoTests: true,
      coverage: {
        reporter: coverageReporter,
        include: ['src/application/web/**/*.ts', 'src/application/web/components/**/*.ts'],
        exclude: ['src/application/web/components/shadcn/**/*', 'src/application/web/**/*.tsx'],
        thresholds: {
          branches: 80,
          functions: 60,
        },
      },
    },
  },
  // Storybookのテスト
  {
    extends: './vite.config.ts',
    plugins: [tailwindcss(), tsconfigPaths(), storybookTest()],
    test: {
      name: 'storybook',
      globals: true,
      browser: {
        enabled: true,
        headless: true,
        provider: 'playwright',
        instances: [
          {
            browser: 'chromium',
          },
        ],
      },
      setupFiles: ['.storybook/vitest.setup.ts'],
      coverage: {
        include: [
          'src/application/web/components/**/*.tsx',
          'src/application/web/features/**/*.tsx',
        ],
        exclude: ['src/application/web/components/shadcn'],
        thresholds: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
      },
    },
  },
])
