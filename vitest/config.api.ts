/// <reference types="vitest" />
// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'vite';
import { srcAlias } from '../config';
import { coverageReporter, coverageThresholds, generateIncludes } from './config';

// ci環境ではDATABASE_URLが設定されているため
const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/test';

const { testInclude, coverageInclude } = generateIncludes('src/application/api');

export default defineConfig({
  resolve: {
    alias: [srcAlias],
  },
  test: {
    globals: true,
    env: {
      DATABASE_URL: dbUrl,
    },
    include: testInclude,
    coverage: {
      reporter: coverageReporter,
      thresholds: coverageThresholds,
      include: coverageInclude,
    },
  },
});
