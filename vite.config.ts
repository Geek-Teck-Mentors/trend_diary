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
      // 最低限の閾値は60%, 分岐以外はもう少し開発が進んでから60%に引き上げる
      thresholds: {
        lines: 40, // 行網羅, ソースコードの全ての行が実行されるかどうか
        statements: 40, // 命令網羅, ソースコードの全ての命令が実行されるかどうか
        branches: 60, // 分岐網羅, 処理のパスの通過率とほぼ同義
        functions: 40, // 関数網羅, 関数の実行パスの通過率
      },
      include: ['src/**/*'],
    },
  },
});
