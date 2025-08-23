import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  process.env = { ...process.env, ...env }

  const isStorybookContext = process.env.NODE_ENV === 'test' && process.env.STORYBOOK

  return {
    plugins: [tailwindcss(), tsconfigPaths(), storybookTest()],
    optimizeDeps: {
      include: [
        'react/jsx-dev-runtime',
        '@storybook/addon-docs',
        '@storybook/blocks',
        '@storybook/react',
        '@storybook/addon-vitest',
      ],
    },
    test: {
      globals: true,
      browser: {
        enabled: true,
        headless: !isStorybookContext,
        provider: 'playwright',
        instances: [
          {
            browser: 'chromium',
          },
        ],
      },
      setupFiles: ['.storybook/vitest.setup.ts'],
      // Storybook経由の場合は timeout を長めに設定
      testTimeout: isStorybookContext ? 30000 : 10000,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'text-summary'],
        include: [
          'src/application/web/components/**/*.tsx',
          'src/application/web/features/**/*.tsx',
        ],
        exclude: [
          'src/application/web/components/ui',
          // shadcn/uiに含まれるコンポーネントは除外
          'src/application/web/components/customized',
        ],
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
