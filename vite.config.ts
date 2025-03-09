/// <reference types="vitest" />

import build from '@hono/vite-build/cloudflare-pages';
// eslint-disable-next-line import/no-extraneous-dependencies
import devServer, { defaultOptions } from '@hono/vite-dev-server';
import adapter from '@hono/vite-dev-server/cloudflare';
// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'vite';
// eslint-disable-next-line import/no-extraneous-dependencies
import { vitePlugin as remix } from '@remix-run/dev';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  ssr: {
    resolve: {
      externalConditions: ['workerd', 'worker'],
    },
  },
  plugins: [
    tailwindcss(),
    remix({
      appDirectory: 'src/app',
    }),
    build(),
    devServer({
      adapter,
      entry: 'src/server.ts',
      exclude: [...defaultOptions.exclude, '/assets/**', '/src/app/**'],
      injectClientScript: false,
    }),
  ],
  optimizeDeps: {
    entries: [],
  },
  test: {
    globals: true,
  },
});
