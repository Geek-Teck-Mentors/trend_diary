/// <reference types="vitest" />
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { coverageReporter, generateIncludes } from '../generate'

const { testInclude, coverageInclude } = generateIncludes('src/common')

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    include: testInclude,
    coverage: {
      reporter: coverageReporter,
      include: coverageInclude,
      // 集約export用のindexを除外
      exclude: ['src/common/**/index.ts'],
    },
  },
})
