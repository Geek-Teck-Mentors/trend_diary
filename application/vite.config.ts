/// <reference types="vitest/config" />
/// <reference types="vitest" />

import { defaultOptions } from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import serverAdapter from 'hono-react-router-adapter/vite'
import { defineConfig } from 'vite'
import babel from 'vite-plugin-babel'
import tsconfigPaths from 'vite-tsconfig-paths'

const ReactCompilerConfig = {}

export default defineConfig({
  ssr: {
    resolve: {
      externalConditions: ['workerd', 'worker'],
    },
  },
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    reactRouter(),
    babel({
      filter: /\.[jt]sx?$/,
      babelConfig: {
        presets: ['@babel/preset-typescript'],
        plugins: [['babel-plugin-react-compiler', ReactCompilerConfig]],
      },
    }),
    serverAdapter({
      adapter,
      entry: 'src/web/server.ts',
      exclude: [...defaultOptions.exclude, '/assets/**', '/src/web/client/**'],
    }),
  ],
  optimizeDeps: {
    entries: [],
  },
  test: {
    globals: true,
  },
})
