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
import { srcAlias } from './config';

export default defineConfig({
  ssr: {
    resolve: {
      externalConditions: ['workerd', 'worker'],
    },
  },
  resolve: {
    alias: [
      // viteではtsconfigに加えて、以下の設定も必要
      srcAlias,
    ],
  },
  plugins: [
    tailwindcss(),
    remix({
      appDirectory: 'src/application/web',
    }),
    build(),
    devServer({
      adapter,
      entry: 'src/application/server.ts',
      exclude: [...defaultOptions.exclude, '/assets/**', '/src/application/web/**'],
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
