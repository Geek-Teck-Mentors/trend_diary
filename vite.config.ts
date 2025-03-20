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
    coverage: {
      reporter: ['text', 'json-summary', 'json'],
      // 最低限の閾値60% 必須。命令網羅や関数網羅はもう少し開発が進んでから導入
      thresholds: {
        branches: 60, // 分岐網羅, 処理のパスの通過率とほぼ同義
      },
      include: ['src/**/*'],
    },
  },
});
