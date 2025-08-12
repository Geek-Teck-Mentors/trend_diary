import { Env } from '@/application/env'

const TEST_ENV = {
  DATABASE_URL: process.env.DATABASE_URL ?? 'postgresql://postgres:password@localhost:5432/test',
  DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL ?? '',
  FEATURE_USER_ENABLED: process.env.FEATURE_USER_ENABLED ?? 'false',
} satisfies Env['Bindings']

export default TEST_ENV
