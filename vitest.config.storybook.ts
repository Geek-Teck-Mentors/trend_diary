import storybookTest from '@storybook/addon-vitest/vitest-plugin'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  process.env = { ...process.env, ...env }
  return {
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
        provider: 'v8',
        reportsDirectory: './coverage/storybook',
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
  }
})
