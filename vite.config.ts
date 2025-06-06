/// <reference types="vitest" />

// eslint-disable-next-line import/no-extraneous-dependencies
import { defaultOptions } from '@hono/vite-dev-server';
import adapter from '@hono/vite-dev-server/cloudflare';
// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'vite';
// eslint-disable-next-line import/no-extraneous-dependencies
import { vitePlugin as remix } from '@remix-run/dev';
import tailwindcss from '@tailwindcss/vite';
import serverAdapter from 'hono-remix-adapter/vite';
import { srcAlias } from './config';

export default defineConfig({
  ssr: {
    resolve: {
      externalConditions: ['workerd', 'worker'],
    },
    external: ['crypto', 'node:events', 'node:net', 'node:perf_hooks', 'node:stream', 'node:tty'],
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
      buildDirectory: 'dist',
    }),
    serverAdapter({
      adapter,
      entry: 'src/application/server.ts',
      exclude: [...defaultOptions.exclude, '/assets/**', '/src/application/web/**'],
    }),
  ],
  optimizeDeps: {
    entries: [],
  },
  test: {
    globals: true,
  },
});
