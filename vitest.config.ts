/// <reference types="vitest" />
import storybookTest from '@storybook/addon-vitest/vitest-plugin'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  process.env = { ...process.env, ...env }

  return {
    test: {
      globals: true,
      projects: [
        {
          plugins: [tsconfigPaths()],
          test: {
            name: 'service',
            globals: true,
            include: ['src/domain/**/*.test.ts', 'src/common/**/*.test.ts'],
            exclude: ['src/domain/**/infrastructure/*'],
          },
        },
        {
          plugins: [tsconfigPaths()],
          test: {
            name: 'api',
            globals: true,
            include: ['src/application/api/**/*.test.ts'],
            env: {
              DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/test',
            },
            pool: 'threads',
            poolOptions: {
              threads: {
                singleThread: true,
              },
            },
          },
        },
        {
          plugins: [tsconfigPaths()],
          test: {
            name: 'frontend',
            globals: true,
            environment: 'jsdom',
            setupFiles: ['./src/test/setup.ts'],
            include: ['src/application/web/**/*.test.ts'],
            exclude: ['src/application/web/components/ui/**/*', 'src/application/web/**/*.tsx'],
          },
        },
        {
          extends: true,
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
          },
        },
      ],
    },
  }
})
