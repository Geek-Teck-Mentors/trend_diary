/// <reference types="vitest" />
// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'vite';
import { coverageReporter, coverageThresholds, generateIncludes } from './config';
import { srcAlias } from '../config';

const { testInclude, coverageInclude } = generateIncludes('src/domain', 'src/common');

// リポジトリの詳細実装での単体テストには担保できる品質特性がないため、除外
const testExclude = ['src/domain/**/infrastructure/*'];

// カバレッジ対象のファイルパスを生成（.test.tsファイル以外全部）
const coverageExclude = [...testExclude];

export default defineConfig({
  resolve: {
    alias: [srcAlias],
  },
  test: {
    globals: true,
    include: testInclude,
    exclude: testExclude,
    coverage: {
      reporter: coverageReporter,
      thresholds: coverageThresholds,
      include: coverageInclude,
      exclude: coverageExclude,
    },
  },
});
