/// <reference types="vitest/config" />
/// <reference types="vitest" />

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defaultOptions } from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import { vitePlugin as remix } from '@remix-run/dev'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import tailwindcss from '@tailwindcss/vite'
import serverAdapter from 'hono-remix-adapter/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url))

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  ssr: {
    resolve: {
      externalConditions: ['workerd', 'worker'],
    },
  },
  plugins: [
    tailwindcss(),
    remix({
      appDirectory: 'src/application/web',
      buildDirectory: 'dist',
    }),
    serverAdapter({
      adapter,
      entry: 'src/application/server.ts',
      exclude: [...defaultOptions.exclude, '/assets/**', '/src/application/web/**'],
    }),
    tsconfigPaths(),
  ],
  optimizeDeps: {
    entries: [],
  },
  test: {
    globals: true,
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
          }),
        ],
        test: {
          name: 'storybook',
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
})
