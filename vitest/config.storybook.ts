import storybookTest from '@storybook/addon-vitest/vitest-plugin'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  process.env = { ...process.env, ...env }
  return {
    plugins: [tailwindcss(), tsconfigPaths()],
    optimizeDeps: {
      include: ['markdown-to-jsx'],
    },
    test: {
      globals: true,
      projects: [
        {
          extends: true,
          plugins: [storybookTest()],
          test: {
            name: 'storybook',
            browser: {
              enabled: true,
              headless: true,
              provider: 'playwright',
              instances: [
                {
                  browser: 'chromium',
                  launch: {
                    executablePath:  process.env.CI === 'true' ? "/home/runner/.cache/ms-playwright/chromium_headless_shell-1169/chrome-linux/chrome" : undefined
                  }
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
