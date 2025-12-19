import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  './vitest.config.domain.ts',
  './vitest.config.api.ts',
  './vitest.config.frontend.ts',
  './vitest.config.storybook.ts',
])
