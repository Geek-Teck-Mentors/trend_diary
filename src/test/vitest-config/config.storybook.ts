import storybookTest from '@storybook/addon-vitest/vitest-plugin'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// playwright周りの調整がやばいので、CIはなし(多分最新のplaywrightを使っていないことが原因)
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  process.env = { ...process.env, ...env }
  return {
    plugins: [tailwindcss(), tsconfigPaths(), storybookTest()],
    test: {
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
        exclude: ['src/application/web/components/ui'],
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
