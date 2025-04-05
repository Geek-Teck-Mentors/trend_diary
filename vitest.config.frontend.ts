/// <reference types="vitest" />
// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      reporter: ['text', 'json-summary', 'json'],
      include: ['src/app/**/*', 'src/components/**/*'],
      exclude: [
        'src/components/ui/**/*',
        'src/domain/**/*',
        'src/common/**/*',
        'src/middleware/**/*',
        'src/logger/**/*',
      ],
    },
  },
});
