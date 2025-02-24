/// <reference types="vitest" />

import build from "@hono/vite-build/cloudflare-pages";
import devServer, { defaultOptions } from "@hono/vite-dev-server";
import adapter from "@hono/vite-dev-server/cloudflare";
import { defineConfig } from "vite";
import { vitePlugin as remix } from "@remix-run/dev";

export default defineConfig({
  ssr: {
    resolve: {
      externalConditions: ["workerd", "worker"],
    },
  },
  plugins: [
    remix({
      appDirectory: "src/app",
    }),
    build(),
    devServer({
      adapter,
      entry: "src/server.ts",
      exclude: [...defaultOptions.exclude, "/assets/**", "/src/app/**"],
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
